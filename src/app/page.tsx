'use client';

import React, { useState } from 'react';
import { ChevronRight, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";

export default function Home() {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>([103.7875, 1.2995]); // One North Default
  const [poiLocation, setPoiLocation] = useState<[number, number] | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mapSource, setMapSource] = useState<'grab' | 'osm' | 'onemap'>('grab');

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
        style={{ width: isCollapsed ? '0px' : '420px', minWidth: isCollapsed ? '0px' : '420px' }}
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
        <MapView center={mapCenter} poiLocation={poiLocation} source={mapSource} />
      </div>
    </main>
  );
}
