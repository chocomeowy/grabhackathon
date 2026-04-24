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

      {/* Dynamic Collapse Toggle - Positioned relative to wrapper */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed z-[100] bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,177,79,0.4)] transition-all hover:scale-110 active:scale-90
          md:top-1/2 md:-translate-y-1/2 md:w-10 md:h-10
          max-md:w-12 max-md:h-12
          ${isMobile 
            ? `right-6 ${isCollapsed ? 'bottom-6 rotate-90' : 'bottom-[52vh] -rotate-90'}` 
            : `left-[${isCollapsed ? '0px' : '405px'}] ${isCollapsed ? 'rotate-180 ml-6' : ''}`}`}
        style={!isMobile ? { left: isCollapsed ? '20px' : '405px' } : {}}
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
