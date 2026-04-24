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
  const [isMobile, setIsMobile] = useState(false);
  const [origin, setOrigin] = useState<[number, number]>([103.7875, 1.2995]); // Default: One North

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        style={{ 
          width: isMobile ? '100%' : (isCollapsed ? '0px' : '420px'),
          minWidth: isMobile ? '100%' : (isCollapsed ? '0px' : '420px'),
          height: isMobile ? (isCollapsed ? '40px' : '50vh') : '100vh',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Sidebar 
          onLocationSelect={handleLocationSelect} 
          onPoiSelect={handlePoiSelect}
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
          mapSource={mapSource}
          onMapSourceChange={setMapSource}
          origin={origin}
        />
      </div>

      {/* Dynamic Collapse Toggle - Positioned relative to sidebar on mobile */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`z-[100] bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,177,79,0.4)] transition-all hover:scale-110 active:scale-90
          ${isMobile 
            ? `fixed right-6 ${isCollapsed ? 'bottom-6 rotate-90' : 'bottom-[calc(50vh-20px)] -rotate-90'}` 
            : `fixed top-1/2 -translate-y-1/2 w-10 h-10 ${isCollapsed ? 'left-[20px] rotate-180' : 'left-[405px]'}`}`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Main Map Experience */}
      <div className="map-wrapper relative flex-1">
        <MapView 
          center={mapCenter} 
          poiLocation={poiLocation} 
          source={mapSource} 
          origin={origin}
          onOriginChange={setOrigin}
        />
      </div>
    </main>
  );
}
