'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";

export default function Home() {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [poiLocation, setPoiLocation] = useState<[number, number] | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapCenter([lng, lat]);
    setPoiLocation(null); // Reset POI when searching new area
  };

  const handlePoiSelect = (lat: number, lng: number) => {
    setPoiLocation([lng, lat]);
  };

  return (
    <main className="main-layout overflow-hidden bg-background">
      {/* Side Intelligence Panel */}
      <div 
        className="sidebar-wrapper transition-all duration-500 ease-in-out" 
        style={{ width: isCollapsed ? '0px' : '420px', opacity: isCollapsed ? 0 : 1 }}
      >
        <Sidebar 
          onLocationSelect={handleLocationSelect} 
          onPoiSelect={handlePoiSelect}
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        />
      </div>

      {/* Main Map Experience */}
      <div className="map-wrapper relative flex-1">
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl z-[100] hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        <MapView center={mapCenter} poiLocation={poiLocation} />
      </div>
    </main>
  );
}
