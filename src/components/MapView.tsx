'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, AlertCircle, RefreshCw, Layers, ShieldAlert, Zap } from 'lucide-react';

type MapSource = 'grab' | 'osm' | 'onemap';

// Fallback Styles
const OSM_STYLE = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap'
    }
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
};

const getOneMapStyle = (token: string) => ({
  version: 8,
  sources: {
    'onemap': {
      type: 'raster',
      tiles: [`https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png`],
      tileSize: 256,
      attribution: 'OneMap Singapore'
    }
  },
  layers: [{ id: 'onemap', type: 'raster', source: 'onemap' }]
});

const GRAB_STYLE = '/api/map/style';

export default function MapView({ center }: { center?: [number, number] | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSource, setCurrentSource] = useState<MapSource>('grab');
  const [error, setError] = useState<string | null>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const isInitializing = useRef(false);

  const initMap = async (source: MapSource) => {
    if (!mapRef.current || isInitializing.current) return;
    
    isInitializing.current = true;
    setIsLoaded(false);
    setCurrentSource(source);

    if (mapInstance.current) {
      try { mapInstance.current.remove(); } catch (e) {}
      mapInstance.current = null;
    }

    try {
      const grabKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || '';
      const onemapKey = process.env.NEXT_PUBLIC_ONEMAP_API_KEY || '';
      
      let style: any = GRAB_STYLE;
      if (source === 'osm') style = OSM_STYLE;
      if (source === 'onemap') style = getOneMapStyle(onemapKey);

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: style,
        center: [103.851959, 1.290270],
        zoom: 13,
        pitch: source === 'grab' ? 45 : 0,
        transformRequest: (url) => {
          if (url.includes('grab.com') || url.includes('/api/map/assets')) {
            return { url, headers: { 'Authorization': `Bearer ${grabKey}` } };
          }
          return { url };
        }
      });

      mapInstance.current = map;

      map.on('load', () => {
        map.resize();
        setIsLoaded(true);
        isInitializing.current = false;
        
        // Re-add marker if center exists
        if (center) {
           const el = document.createElement('div');
           el.className = 'pulse-marker';
           markerInstance.current = new maplibregl.Marker({ element: el })
             .setLngLat(center)
             .addTo(map);
        }
      });

      map.on('error', (e: any) => {
        if (source === 'grab' && !isLoaded) {
           console.error('MAP: Grab failed. Auto-switching to OSM...');
           isInitializing.current = false;
           initMap('osm');
        }
      });

      if (source === 'grab') {
        setTimeout(() => {
          if (!isLoaded && mapInstance.current === map) {
            isInitializing.current = false;
            initMap('osm');
          }
        }, 4000);
      }

    } catch (err: any) {
      isInitializing.current = false;
      if (source === 'grab') initMap('osm');
      else setError(err.message);
    }
  };

  useEffect(() => {
    initMap('grab');
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, []);

  useEffect(() => {
    if (mapInstance.current && center && isLoaded) {
      mapInstance.current.flyTo({ center, zoom: 16, speed: 1.2, essential: true });
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

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      <div ref={mapRef} className="absolute inset-0 z-0 bg-zinc-900" style={{ width: '100%', height: '100%' }} />
      
      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Manual Source Toggles */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-2">
         <button 
           onClick={() => initMap('grab')}
           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all backdrop-blur-xl border ${currentSource === 'grab' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
         >
           GrabMaps
         </button>
         <button 
           onClick={() => initMap('onemap')}
           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all backdrop-blur-xl border ${currentSource === 'onemap' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
         >
           OneMap SG
         </button>
         <button 
           onClick={() => initMap('osm')}
           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all backdrop-blur-xl border ${currentSource === 'osm' ? 'bg-zinc-600 text-white border-zinc-600 shadow-lg shadow-zinc-600/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
         >
           OSM Layer
         </button>
      </div>

      {currentSource !== 'grab' && isLoaded && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
           <div className={`px-5 py-2.5 backdrop-blur-3xl border rounded-full flex items-center gap-3 shadow-2xl ${currentSource === 'onemap' ? 'bg-blue-600/20 border-blue-500/40' : 'bg-zinc-600/20 border-zinc-500/40'}`}>
             <div className={`w-2 h-2 rounded-full animate-ping ${currentSource === 'onemap' ? 'bg-blue-500' : 'bg-zinc-500'}`} />
             <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentSource === 'onemap' ? 'text-blue-400' : 'text-zinc-400'}`}>
               {currentSource === 'onemap' ? 'OneMap Authority Active' : 'OSM Resilience Active'}
             </span>
           </div>
        </div>
      )}

      {!isLoaded && !error && (
        <div className="absolute inset-0 z-20 bg-[#0a0f1a] flex flex-col items-center justify-center gap-8">
          <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">PulseMap</h3>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Establishing Link</p>
          </div>
        </div>
      )}
    </div>
  );
}
