'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Sparkles, AlertCircle } from 'lucide-react';

export default function MapView({ center }: { center?: [number, number] | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || '';
        if (!apiKey) {
          setError('API Key missing');
          return;
        }

        console.log('DEBUG: Connecting to Urban Pulse...');

        // 1. Initialize MapLibre with our backend-proxied style
        mapInstance.current = new maplibregl.Map({
          container: mapRef.current,
          style: '/api/map/style', 
          center: [103.851959, 1.290270],
          zoom: 13,
          pitch: 45,
          antialias: true,
          transformRequest: (url) => {
            // Crucial: All Grab tile requests need the Bearer token
            if (url.includes('grab.com')) {
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
          console.log('SUCCESS: High-Fidelity Mapping Active');
          setIsLoaded(true);
        });

        mapInstance.current.on('error', (e: any) => {
          console.warn('MAP LOG:', e);
          if (e.error?.status === 403 || e.error?.status === 401) {
             setError('Connection Forbidden. Verify API Key and Referer.');
          }
        });

      } catch (err: any) {
        console.error('MAP FATAL:', err);
        setError(err.message);
      }
    };

    initMap();
    return () => mapInstance.current?.remove();
  }, []);

  return (
    <div className="absolute inset-0 bg-[#050505] overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 z-0 bg-[#050505]" style={{ opacity: isLoaded ? 1 : 0.5, transition: 'opacity 1.5s ease' }} />
      
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-3xl z-50 p-10">
          <div className="glass-card p-12 flex flex-col items-center gap-8 max-w-lg text-center border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Sync Failure</h3>
              <p className="text-sm text-muted-foreground font-bold">{error}</p>
            </div>
            <button onClick={() => window.location.reload()} className="btn-primary w-full py-5">Retry Link</button>
          </div>
        </div>
      )}

      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#050505]">
          <div className="flex flex-col items-center gap-10">
            <div className="relative">
              <div className="w-24 h-24 border-[4px] border-primary/5 border-t-primary rounded-full animate-spin" />
              <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-bounce" />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">PulseMap SG</h3>
              <div className="flex items-center gap-2 justify-center">
                 <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.6em] animate-pulse">Initializing Urban Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
