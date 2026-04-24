'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';

const FALLBACK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const GRAB_STYLE = '/api/map/style';

export default function MapView({ center }: { center?: [number, number] | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstance = useRef<any>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (mapInstance.current && center && isLoaded) {
      mapInstance.current.flyTo({
        center: center,
        zoom: 16,
        speed: 1.2,
        curve: 1.4,
        essential: true
      });
    }
  }, [center, isLoaded]);

  const initMap = async (useFallback = false) => {
    if (!mapRef.current || isInitializing.current) return;
    
    isInitializing.current = true;
    setIsLoaded(false);

    // Clean up existing instance thoroughly
    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (e) {}
      mapInstance.current = null;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || '';
      const styleUrl = useFallback ? FALLBACK_STYLE : GRAB_STYLE;

      console.log(`MAP: Starting initialization [Fallback=${useFallback}]`);

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: [103.851959, 1.290270],
        zoom: 13,
        pitch: 45,
        antialias: true,
        transformRequest: (url) => {
          if (url.includes('grab.com') || url.includes('/api/map/assets')) {
            return {
              url: url,
              headers: { 'Authorization': `Bearer ${apiKey}` }
            };
          }
          return { url };
        }
      });

      mapInstance.current = map;

      map.on('load', () => {
        console.log('MAP: Load complete.');
        setIsLoaded(true);
        setIsFallback(useFallback);
        isInitializing.current = false;
      });

      map.on('error', (e: any) => {
        // Log errors but filter out non-fatal ones (like missing sprites/glyphs)
        const errorMsg = e?.error?.message || '';
        console.warn('MAP EVENT ERROR:', errorMsg);

        // FATAL: If Grab style fails and we haven't switched yet
        if (!useFallback && !isFallback && !isLoaded) {
           // We only trigger re-init if the map hasn't loaded yet (style/init failure)
           console.error('MAP FATAL: Grab init failed. Switching to OSM...');
           isInitializing.current = false;
           initMap(true);
        }
      });

      // Absolute timeout for Grab
      if (!useFallback) {
        setTimeout(() => {
          if (!isLoaded && mapInstance.current === map && !isFallback) {
            console.error('MAP TIMEOUT: Grab hung. Forcing OSM...');
            isInitializing.current = false;
            initMap(true);
          }
        }, 5000);
      }

    } catch (err: any) {
      console.error('MAP CONSTRUCTOR FATAL:', err);
      isInitializing.current = false;
      if (!useFallback) initMap(true);
      else setError(err.message);
    }
  };

  useEffect(() => {
    initMap();
    return () => {
      if (mapInstance.current) mapInstance.current.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-[#050505] overflow-hidden flex items-center justify-center">
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0" 
        style={{ 
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease' 
        }} 
      />
      
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Manual Switch Button - Just in case */}
      {!isFallback && isLoaded && (
        <button 
          onClick={() => initMap(true)}
          className="absolute top-6 right-20 z-50 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-[9px] font-black uppercase text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Layers className="w-3 h-3" /> Force OSM Fallback
        </button>
      )}

      {isFallback && isLoaded && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
           <div className="px-5 py-2.5 bg-amber-500/20 backdrop-blur-2xl border border-amber-500/30 rounded-full flex items-center gap-3 shadow-2xl">
             <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">OpenStreetMap Mode</span>
           </div>
        </div>
      )}

      {!isLoaded && !error && (
        <div className="relative z-20 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
            <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-bounce" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">PulseMap</h3>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-2">Connecting Grid...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="relative z-50 p-10 max-w-md w-full">
          <div className="glass-card p-10 flex flex-col items-center gap-8 text-center border-red-500/20">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Sync Blocked</h3>
            <button onClick={() => window.location.reload()} className="btn-primary w-full py-5">Retry Connection</button>
          </div>
        </div>
      )}
    </div>
  );
}
