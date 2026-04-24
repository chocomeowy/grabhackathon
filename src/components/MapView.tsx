'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, AlertCircle, RefreshCw, Layers, ShieldAlert } from 'lucide-react';

// Robust Raster Fallback (No vector complexity, no fonts to fail)
const FALLBACK_STYLE = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

const GRAB_STYLE = '/api/map/style';

export default function MapView({ center }: { center?: [number, number] | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (mapInstance.current && center && isLoaded) {
      // 1. Move the viewport
      mapInstance.current.flyTo({
        center: center,
        zoom: 16,
        speed: 1.2,
        essential: true
      });

      // 2. Add/Move the "Pulse Arrow" Marker
      if (markerInstance.current) {
        markerInstance.current.setLngLat(center);
      } else {
        const el = document.createElement('div');
        el.className = 'pulse-marker';
        markerInstance.current = new maplibregl.Marker({ element: el })
          .setLngLat(center)
          .addTo(mapInstance.current);
      }
    }
  }, [center, isLoaded]);

  const initMap = async (useFallback = false) => {
    if (!mapRef.current || isInitializing.current) return;
    
    isInitializing.current = true;
    console.log(`MAP: Init started. Fallback Mode: ${useFallback}`);

    if (mapInstance.current) {
      try { mapInstance.current.remove(); } catch (e) {}
      mapInstance.current = null;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || '';
      
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: useFallback ? (FALLBACK_STYLE as any) : GRAB_STYLE,
        center: [103.851959, 1.290270],
        zoom: 13,
        pitch: useFallback ? 0 : 45, // Simpler for raster
        transformRequest: (url) => {
          if (url.includes('grab.com') || url.includes('/api/map/assets')) {
            return { url, headers: { 'Authorization': `Bearer ${apiKey}` } };
          }
          return { url };
        }
      });

      mapInstance.current = map;

      map.on('load', () => {
        console.log('MAP: Load complete.');
        map.resize(); // FORCE CANVAS TO FILL PARENT
        setIsLoaded(true);
        setIsFallback(useFallback);
        isInitializing.current = false;
      });

      map.on('error', (e: any) => {
        if (!useFallback && !isFallback && !isLoaded) {
           console.error('MAP: Grab failed. Hot-swapping to OSM Raster...');
           isInitializing.current = false;
           initMap(true);
        }
      });

      // Rapid failover
      if (!useFallback) {
        setTimeout(() => {
          if (!isLoaded && mapInstance.current === map) {
            console.warn('MAP: Grab Timeout. Switching to Raster...');
            isInitializing.current = false;
            initMap(true);
          }
        }, 3000);
      }

    } catch (err: any) {
      console.error('MAP: Constructor failed.', err);
      isInitializing.current = false;
      if (!useFallback) initMap(true);
      else setError(err.message);
    }
  };

  useEffect(() => {
    initMap();
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      {/* MAP CONTAINER - NO OPACITY FILTER - FORCE VISIBILITY */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0 bg-zinc-900" 
        style={{ width: '100%', height: '100%' }} 
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {isFallback && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
           <div className="px-5 py-2.5 bg-red-600/20 backdrop-blur-3xl border border-red-500/40 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
             <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
             <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">OSM Raster Fallback Active</span>
           </div>
        </div>
      )}

      {/* Loading Overlay - Only show if not loaded */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 z-20 bg-[#0a0f1a] flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-bounce" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">PulseMap</h3>
            <div className="flex items-center gap-2 justify-center">
               <RefreshCw className="w-3 h-3 text-primary animate-spin" />
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Linking Neural Grid</p>
            </div>
            
            {/* Last Resort Retry Button - Appears after 10s of nothingness */}
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase text-white/40 hover:text-white transition-all animate-pulse"
            >
              Manual Sync Overload
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="relative z-50 glass-card p-12 text-center border-red-500/30">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white uppercase mb-4">Link Severed</h3>
          <button onClick={() => window.location.reload()} className="btn-primary w-full py-4">Re-Initialize</button>
        </div>
      )}
    </div>
  );
}
