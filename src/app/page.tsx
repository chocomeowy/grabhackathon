'use client';

import React, { useState } from 'react';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";

export default function Home() {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [poiLocation, setPoiLocation] = useState<[number, number] | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mapSource, setMapSource] = useState<'grab' | 'osm' | 'onemap'>('osm');

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapCenter([lng, lat]);
    setPoiLocation(null);
  };

  const handlePoiSelect = (lat: number, lng: number) => {
    setPoiLocation([lng, lat]);
  };

  return (
    <main className="main-layout overflow-hidden bg-background">
      {/* Side Intelligence Panel */}
      <div 
        className="sidebar-wrapper" 
        style={{ width: isCollapsed ? '0px' : '420px', minWidth: isCollapsed ? '0px' : '420px', opacity: isCollapsed ? 0 : 1 }}
      >
        <Sidebar 
          onLocationSelect={handleLocationSelect} 
          onPoiSelect={handlePoiSelect}
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
          mapSource={mapSource}
          onMapSourceChange={setMapSource}
        />
      </div>

      {/* Main Map Experience */}
      <div className="map-wrapper relative flex-1">
        <AnimatePresence>
          {isCollapsed && (
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => setIsCollapsed(false)}
              className="absolute left-6 top-6 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,177,79,0.5)] z-[1000] hover:scale-110 active:scale-95 transition-all border border-white/20"
            >
              <LayoutDashboard className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
        <MapView center={mapCenter} poiLocation={poiLocation} source={mapSource} />
      </div>
    </main>
  );
}
