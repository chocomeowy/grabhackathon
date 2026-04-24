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

export default function MapView({ center, poiLocation, source = 'grab' }: { 
  center?: [number, number] | null,
  poiLocation?: [number, number] | null,
  source?: MapSource
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerInstance = useRef<maplibregl.Marker | null>(null);
  const poiMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<MapSource>(source);
  const isInitializing = useRef(false);

  const initMap = async (source: MapSource) => {
    if (!mapRef.current) return;
    
    isInitializing.current = true;
    setIsLoaded(false);
    setCurrentSource(source);
    setError(null);

    if (mapInstance.current) {
      try { 
        mapInstance.current.remove(); 
        mapInstance.current = null;
      } catch (e) {}
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
        renderWorldCopies: false,
        transformRequest: (url) => {
          if (url.includes('grab.com') || url.includes('/api/map/assets')) {
            return { url, headers: { 'Authorization': `Bearer ${grabKey}` } };
          }
          return { url };
        }
      });

      mapInstance.current = map;

      map.on('error', (e) => {
        // Ignore tile loading errors (like 502s) to keep the map active
        console.warn('Mapbox/MapLibre error ignored:', e.error?.message || e);
      });

      map.on('load', () => {
        setTimeout(() => map.resize(), 100);
        setIsLoaded(true);
        isInitializing.current = false;

        // Register Path Source
        if (!map.getSource('pulse-path')) {
          map.addSource('pulse-path', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} }
          });
          map.addLayer({
            id: 'pulse-path',
            type: 'line',
            source: 'pulse-path',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#00b14f', 'line-width': 4, 'line-dasharray': [2, 1] }
          });
        }
      });

      // Simple load timeout as a safety net for the UI overlay
      setTimeout(() => {
        if (!isLoaded && mapInstance.current === map) {
          setIsLoaded(true);
          isInitializing.current = false;
        }
      }, 5000);

    } catch (err: any) {
      isInitializing.current = false;
      setError(err.message);
    }
  };

  useEffect(() => {
    initMap(source);
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, [source]);

  useEffect(() => {
    if (mapInstance.current && isLoaded) {
      const map = mapInstance.current;
      
      // Update Neighborhood Center
      if (center) {
        if (markerInstance.current) markerInstance.current.remove();
        const el = document.createElement('div');
        el.className = 'pulse-marker main-pulse';
        markerInstance.current = new maplibregl.Marker({ element: el })
          .setLngLat(center)
          .addTo(map);

        if (!poiLocation) {
          map.flyTo({ center, zoom: 16, speed: 1.2, essential: true });
        }
      }

      // Update Selected POI
      if (poiLocation) {
        if (poiMarkerRef.current) poiMarkerRef.current.remove();
        const el = document.createElement('div');
        el.className = 'pulse-marker poi-pulse';
        el.style.backgroundColor = '#ffffff';
        poiMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(poiLocation)
          .addTo(map);

        // Draw Line between center and POI
        if (center) {
          const pathSource = map.getSource('pulse-path') as any;
          if (pathSource) {
            pathSource.setData({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [center, poiLocation]
              },
              properties: {}
            });
          }
          
          // Fit both in view
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend(center);
          bounds.extend(poiLocation);
          map.fitBounds(bounds, { padding: 100, speed: 1.2 });
        }
      } else {
        // Clear Path and POI Marker
        if (poiMarkerRef.current) poiMarkerRef.current.remove();
        const pathSource = map.getSource('pulse-path') as any;
        if (pathSource) {
          pathSource.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} });
        }
      }
    }
  }, [center, poiLocation, isLoaded]);

  return (
    <div 
      className="bg-[#0a0a0a] overflow-hidden flex items-center justify-center"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    >
      <div 
        ref={mapRef} 
        className="bg-zinc-900" 
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} 
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-md flex items-center justify-center">
           <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Syncing Urban Nodes...</span>
           </div>
        </div>
      )}

      <div className="absolute bottom-10 left-10 pointer-events-none z-10">
        <div className="flex items-center gap-4 p-4 glass-card bg-black/40 border-white/5">
           <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#00b14f]" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Midnight Intelligence Layer Active</span>
        </div>
      </div>
    </div>
  );
}
