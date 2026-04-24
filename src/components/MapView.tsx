'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

// Reliable high-fidelity dark style for fallback
const FALLBACK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const GRAB_STYLE = '/api/map/style';

export default function MapView({ center }: { center?: [number, number] | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstance = useRef<any>(null);

  // Synchronize map viewport with external center updates
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
    if (!mapRef.current) return;
    
    // Clean up existing instance if any
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || '';
      const styleUrl = useFallback ? FALLBACK_STYLE : GRAB_STYLE;

      console.log(`MAP: Initializing with ${useFallback ? 'OSM Fallback' : 'Grab Style'}...`);

      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: [103.851959, 1.290270],
        zoom: 13,
        pitch: 45,
        antialias: true,
        transformRequest: (url) => {
          // Only apply auth to Grab requests
          if (url.includes('grab.com') || url.includes('/api/map/assets')) {
            return {
              url: url,
              headers: { 'Authorization': `Bearer ${apiKey}` }
            };
          }
          return { url };
        }
      });

      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      mapInstance.current.on('load', () => {
        console.log('MAP SUCCESS: Loaded.');
        setIsLoaded(true);
        if (useFallback) setIsFallback(true);
      });

      mapInstance.current.on('error', (e: any) => {
        console.error('MAP ERROR:', e);
        // If Grab style or tiles fail and we haven't tried fallback yet, try it
        if (!useFallback && !isFallback) {
          console.warn('MAP FAILURE: Triggering hardware re-init to OSM...');
          initMap(true);
        }
      });

      // Auto-fallback timer for Grab
      if (!useFallback) {
        setTimeout(() => {
          if (!isLoaded && !mapInstance.current?.loaded()) {
            console.warn('MAP TIMEOUT: Grab too slow, switching to OSM...');
            initMap(true);
          }
        }, 4000);
      }

    } catch (err: any) {
      console.error('MAP FATAL:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    initMap();
    return () => mapInstance.current?.remove();
  }, []);

  return (
    <div className="absolute inset-0 bg-[#050505] overflow-hidden flex items-center justify-center">
      {/* Map Container - Enforce visibility */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0" 
        style={{ 
          opacity: isLoaded ? 1 : 0, 
          visibility: isLoaded ? 'visible' : 'hidden',
          transition: 'opacity 1s ease' 
        }} 
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Fallback Indicator */}
      {isFallback && isLoaded && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
           <div className="px-5 py-2.5 bg-amber-500/20 backdrop-blur-2xl border border-amber-500/30 rounded-full flex items-center gap-3 shadow-2xl">
             <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">OpenStreetMap Active</span>
           </div>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && !error && (
        <div className="relative z-20 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin" />
            <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-primary animate-bounce" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">PulseMap</h3>
            <div className="flex items-center gap-3 justify-center">
               <RefreshCw className="w-4 h-4 text-primary animate-spin" />
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Syncing Urban Nodes</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="relative z-50 p-10 max-w-md w-full">
          <div className="glass-card p-10 flex flex-col items-center gap-8 text-center border-red-500/20">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Sync Blocked</h3>
              <p className="text-sm text-muted-foreground font-bold">{error}</p>
            </div>
            <button onClick={() => window.location.reload()} className="btn-primary w-full py-5">Reconnect Link</button>
          </div>
        </div>
      )}
    </div>
  );
}
