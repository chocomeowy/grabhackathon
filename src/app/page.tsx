'use client';

import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";

export default function Home() {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    // Note: MapLibre uses [lng, lat]
    setMapCenter([lng, lat]);
  };

  return (
    <main className="main-layout overflow-hidden bg-background">
      {/* Side Intelligence Panel */}
      <div className="sidebar-wrapper">
        <Sidebar onLocationSelect={handleLocationSelect} />
      </div>

      {/* Main Map Experience */}
      <div className="map-wrapper relative">
        <MapView center={mapCenter} />
      </div>
    </main>
  );
}
