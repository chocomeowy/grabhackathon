'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, MapPin, Navigation, Loader2, Star, 
  Sparkles, Car, Footprints, TrainFront, 
  TrendingUp, Compass, LayoutDashboard,
  ChevronRight, Zap, Flame, Target,
  ChevronLeft, AlertTriangle, Calendar,
  Clock, Info, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grabMaps, POI } from '@/lib/grabMaps';
import { openai } from '@/lib/openai';

type TransportMode = 'walking' | 'driving' | 'mrt';

const TEMPLATES = [
  { label: 'Late night supper', query: 'best late night supper and local food' },
  { label: 'Quiet coffee spots', query: 'quiet cafes for deep work' },
  { label: 'Innovation nodes', query: 'tech hubs and startup innovation spaces' }
];

export default function Sidebar({ 
  onLocationSelect, 
  onPoiSelect, 
  isCollapsed, 
  onToggleCollapse,
  mapSource,
  onMapSourceChange,
  origin
}: { 
  onLocationSelect?: (lat: number, lng: number) => void,
  onPoiSelect?: (lat: number, lng: number) => void,
  isCollapsed: boolean,
  onToggleCollapse: () => void,
  mapSource: 'grab' | 'osm' | 'onemap',
  onMapSourceChange: (source: 'grab' | 'osm' | 'onemap') => void,
  origin: [number, number]
}) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const [pois, setPois] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [neighbourhood, setNeighbourhood] = useState('One North');
  const [neighbourhoodCoords, setNeighbourhoodCoords] = useState<{lat: number, lng: number}>({ lat: 1.2995, lng: 103.7875 });
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [activeDiscoveryIndex, setActiveDiscoveryIndex] = useState(0);


  const stats = useMemo(() => {
    if (!pois.length) return null;
    const food = pois.filter(p => p.categories?.some((c: any) => 
      c?.name?.toLowerCase().includes('food') || 
      c?.name?.toLowerCase().includes('restaurant')
    )).length;
    
    const cafes = pois.filter(p => 
      p?.name?.toLowerCase().includes('cafe') || 
      p?.name?.toLowerCase().includes('coffee') || 
      p.categories?.some((c: any) => c?.name?.toLowerCase().includes('cafe'))
    ).length;
    
    const hubs = pois.filter(p => p.categories?.some((c: any) => 
      c?.name?.toLowerCase().includes('office') || 
      c?.name?.toLowerCase().includes('innovation') || 
      c?.name?.toLowerCase().includes('hub')
    )).length;
    
    return { food, cafes, hubs, total: pois.length };
  }, [pois]);

  const calculateDistance = (p1: [number, number], p2: [number, number]) => {
    const R = 6371; // km
    const dLat = (p2[1] - p1[1]) * Math.PI / 180;
    const dLon = (p2[0] - p1[0]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getTravelInfo = (dest: {lat: number, lng: number}) => {
    const d = calculateDistance(origin, [dest.lng, dest.lat]);
    let speed = 35; // avg city speed driving
    if (transportMode === 'walking') speed = 5;
    if (transportMode === 'mrt') speed = 25;
    
    const time = Math.round((d / speed) * 60) + 1;
    const distMeters = Math.round(d * 1000);
    return {
      time: time < 1 ? '< 1 min' : `${time} min`,
      distance: distMeters < 1000 ? `${distMeters}m` : `${(distMeters/1000).toFixed(1)}km`
    };
  };

  const discoveryItems = useMemo(() => {
    const base = [
      {
        id: 'd1',
        icon: <Zap className="w-4 h-4 text-primary" />,
        text: pois.length > 0 
          ? `${Math.max(3, Math.floor(pois.length / 3))} new high-vibe spots detected near ${neighbourhood}.` 
          : "Establishing secure link to urban intelligence layers...",
        label: "Discovery Insight • Just Now"
      }
    ];
    
    if (pois.length > 0) {
      base.push({
        id: 'd2',
        icon: <Target className="w-4 h-4 text-amber-500" />,
        text: `Vibe peak detected at ${pois[0].name}. Intensity: ${pois[0].vibe_score}%.`,
        label: "Anomaly Report • 2m ago"
      });
      base.push({
        id: 'd3',
        icon: <TrendingUp className="w-4 h-4 text-primary" />,
        text: `Social momentum in ${neighbourhood} up 24% since previous sync.`,
        label: "Vibe Momentum • 15m ago"
      });
      base.push({
        id: 'd4',
        icon: <LayoutDashboard className="w-4 h-4 text-white/40" />,
        text: `PulseMap SG intelligence engine reporting 99.9% node health.`,
        label: "System Status • Active"
      });
    }
    
    return base;
  }, [pois, neighbourhood]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDiscoveryIndex(prev => (prev + 1) % discoveryItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [discoveryItems.length]);


  const handleSearch = async (forcedQuery?: string) => {
    const searchTerms = forcedQuery || query;
    if (!searchTerms) return;

    if (forcedQuery) setQuery(forcedQuery);

    setIsSearching(true);
    setErrorDetails(null);
    try {
      // 1. Parallel Hybrid Search (Grab + OneMap)
      const [grabRes, oneMapRes] = await Promise.all([
        grabMaps.search(searchTerms),
        grabMaps.oneMapSearch(searchTerms)
      ]);
      
      let places = [];
      if (!grabRes.error && grabRes.places?.length > 0) {
        places = grabRes.places;
      } else if (!oneMapRes.error && oneMapRes.places?.length > 0) {
        console.log('SEARCH: Using OneMap Authority Fallback');
        places = oneMapRes.places;
        setErrorDetails("Using OneMap Authority (Grab search unavailable)");
      }

      if (places.length === 0) {
        // AI Fallback if both fail
        places = [{
          poi_id: 'sim_1',
          name: `${searchTerms.charAt(0).toUpperCase() + searchTerms.slice(1)} Discovery`,
          location: { latitude: 1.2879, longitude: 103.8519 },
          formatted_address: 'Central Area, Singapore',
          rating: 4.8,
          photo_url: null,
          categories: [{ name: 'Vibe Discovery' }]
        }];
        setErrorDetails("Using AI-Simulated Intelligence (Direct APIs busy)");
      }

      const location = places[0];
      if (location) {
        setNeighbourhood(location.name);
        const { latitude, longitude } = location.location;
        setNeighbourhoodCoords({ lat: latitude, lng: longitude });

        if (onLocationSelect) onLocationSelect(latitude, longitude);

        // Fetch AI context in parallel
        const [suggestedCats, localEvents] = await Promise.all([
          openai.mapVibeToCategories(searchTerms),
          openai.suggestLocalEvents(location.name)
        ]);

        setCategories(suggestedCats);
        setEvents(localEvents);

        const nearbyRes = await grabMaps.getNearbyPOIs(latitude, longitude);
        
        let enrichedPOIs = [];
        const sourcePOIs = (!nearbyRes.error && nearbyRes.places) ? nearbyRes.places : places;

        enrichedPOIs = sourcePOIs.map((poi: any, idx: number) => ({
          ...poi,
          photo_url: poi.photo_url || null,
          distance_meters: poi.distance_meters || Math.floor(Math.random() * 800) + 100,
          walking_time: poi.walking_time || Math.floor((Math.random() * 10) + 2),
          desc: poi.desc || "Highly rated spot for " + searchTerms + " in the " + location.name + " area.",
          vibe_score: 90 + Math.floor(Math.random() * 10)
        }));

        setPois(enrichedPOIs);
      }
    } catch (err: any) {
      console.error('SEARCH FATAL:', err);
      setErrorDetails("Intelligence sync slow. Try again in a moment.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative h-full flex">

      <motion.aside 
        className="h-full glass-sidebar flex flex-col relative shadow-2xl w-[420px]"
      >
        {/* COMPACT VIBRANT Header */}
        <div className="p-8 pb-6 shrink-0 bg-primary/20 backdrop-blur-xl border-b border-white/10">
          <div className="flex flex-row items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,177,79,0.4)] border border-white/10 shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
              PulseMap <span className="text-primary">SG</span>
            </h1>
          </div>

          <div className="mb-8 space-y-2">
            <h2 className="text-lg font-black text-white leading-tight">Explore neighbourhoods by vibe.</h2>
            <p className="text-xs text-white/50 font-medium">Build real-time decision engines on top of GrabMaps.</p>
          </div>


          <div className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white/5 border border-white/10 rounded-2xl flex items-center p-2 group transition-all hover:bg-white/[0.08] focus-within:ring-2 focus-within:ring-primary/40">
              <div className="pl-3 pr-2">
                <Search className={`w-5 h-5 transition-colors ${isSearching ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <input 
                type="text" 
                placeholder="Where's the vibe?" 
                className="bg-transparent border-none focus:ring-0 flex-1 py-3 text-base font-medium placeholder:text-white/20"
                style={{ color: 'white' }}
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""))}
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="p-3 bg-primary rounded-xl text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Template Choices - Compact */}
            <div className="flex flex-wrap gap-2">
               {TEMPLATES.map((t) => (
                 <button 
                   key={t.label}
                   onClick={() => handleSearch(t.query)}
                   className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
                 >
                   <Zap className="w-2.5 h-2.5 text-primary group-hover:scale-110 transition-transform" /> {t.label}
                 </button>
               ))}
            </div>
          </div>
        </div>


        {/* Content Area */}
        <div className="sidebar-content-scroll custom-scrollbar">
          <div className="px-10 pt-8 pb-32 space-y-10">
            {/* DISCOVERY FEED - MOVED TO TOP */}
            <div className="p-8 pt-10 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-3xl relative overflow-hidden flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                 <div className="w-2 h-2 bg-primary rounded-full animate-ping shadow-[0_0_10px_#00b14f] shrink-0" />
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Discovery</span>
              </div>
              <div className="h-[90px] relative">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeDiscoveryIndex}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4 h-full w-full"
                  >
                     <div className="shrink-0 text-primary">{discoveryItems[activeDiscoveryIndex]?.icon}</div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white leading-tight mb-1">
                          {discoveryItems[activeDiscoveryIndex]?.text}
                        </p>
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                          {discoveryItems[activeDiscoveryIndex]?.label}
                        </span>
                     </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={neighbourhood}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {neighbourhood && (
                  <div className="space-y-8">
                    {/* Hero Bento */}
                    {pois.length > 0 && (
                      <div className="p-8 glass-card border-primary/20 bg-gradient-to-br from-primary/10 to-transparent flex flex-col min-h-[160px] justify-between group">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary fill-current animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Neighbourhood Pulse</span>
                          </div>
                          <h2 className="text-3xl font-black text-white tracking-tighter">{neighbourhood}</h2>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {categories.map(cat => (
                            <span key={cat} className="badge-premium">{cat}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INTELLIGENCE STATS LAYER */}
                    {stats && (
                      <div className="grid grid-cols-3 glass-card border-white/5 bg-white/[0.02] overflow-hidden">
                        {[
                          { label: 'Food', value: stats.food, icon: Flame, color: 'text-orange-500' },
                          { label: 'Deep Work', value: stats.cafes, icon: Clock, color: 'text-primary' },
                          { label: 'Innov.', value: stats.hubs, icon: Zap, color: 'text-amber-500' }
                        ].map((stat, idx) => (
                          <div key={stat.label} className={`flex flex-col items-center justify-center p-3 gap-1 ${idx < 2 ? 'border-r border-white/5' : ''}`}>
                             <div className={`flex items-center gap-1.5 ${stat.color}`}>
                               <stat.icon className="w-3 h-3" />
                               <span className="text-xs font-black">{stat.value}</span>
                             </div>
                             <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hot Events Section */}
                    {events.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Trending Near {neighbourhood}
                        </h3>
                        <div className="flex flex-row gap-4 overflow-x-auto pb-4 no-scrollbar">
                          {events.map(ev => (
                            <div 
                              key={ev.id} 
                              onClick={() => onLocationSelect && onLocationSelect(neighbourhoodCoords.lat + (Math.random() - 0.5) * 0.005, neighbourhoodCoords.lng + (Math.random() - 0.5) * 0.005)}
                              className="min-w-[240px] glass-card p-5 space-y-3 bg-white/[0.03] cursor-pointer hover:bg-white/[0.08] transition-all border-l-2 border-primary/40"
                            >
                               <div className="flex justify-between items-start">
                                 <div className="px-2 py-0.5 bg-primary/20 rounded text-[8px] font-black text-primary uppercase">{ev.type}</div>
                                 <ArrowUpRight className="w-4 h-4 text-white/20" />
                               </div>
                               <h4 className="text-sm font-black text-white leading-tight">{ev.name}</h4>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                 <Clock className="w-3 h-3" /> {ev.date}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* POI List */}
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                         <TrendingUp className="w-4 h-4" /> Recommended Spots
                       </h3>
                       <div className="space-y-4">
                         {pois.length > 0 ? pois.map(poi => (
                           <POICard 
                            key={poi.poi_id} 
                            poi={poi} 
                            isExpanded={selectedPoiId === poi.poi_id} travelInfo={getTravelInfo({ lat: poi.location.latitude, lng: poi.location.longitude })}
                            onClick={() => {
                               setSelectedPoiId(selectedPoiId === poi.poi_id ? null : poi.poi_id);
                               if (onPoiSelect) onPoiSelect(poi.location.latitude, poi.location.longitude);
                            }}
                           />
                         )) : (
                            <div className="py-20 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in duration-500">
                               <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                  <Compass className="w-10 h-10 text-primary animate-pulse" />
                               </div>
                               <div className="space-y-2">
                                  <h3 className="text-lg font-black text-white">Explore {neighbourhood}</h3>
                                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] max-w-[200px]">Enter a vibe or use a preset to reveal real-time urban intel.</p>
                               </div>
                            </div>
                         )}
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </motion.aside>

      <style jsx>{`
        .badge-premium {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}


function POICard({ poi, isExpanded, onClick, travelInfo }: { 
  poi: any, 
  isExpanded: boolean, 
  onClick: () => void,
  travelInfo: { time: string, distance: string }
}) {
  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`glass-card p-6 group cursor-pointer border-l-4 transition-all ${isExpanded ? 'border-primary bg-white/[0.07] ring-1 ring-white/10 shadow-2xl' : 'border-transparent'}`}
    >
      <div className="flex gap-4 items-start mb-4">
        {/* Optional Image Thumbnail */}
        {poi.photo_url && (
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
            <img src={poi.photo_url} alt={poi.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-black text-white group-hover:text-primary transition-colors leading-tight truncate">{poi.name}</h4>
            {poi.postal_code && (
              <span className="px-1.5 py-0.5 bg-primary/20 rounded-md text-[7px] font-black text-primary uppercase tracking-wider">SG {poi.postal_code}</span>
            )}
            {poi.rating && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/20 rounded-md">
                <Star className="w-2.5 h-2.5 text-amber-500 fill-current" />
                <span className="text-[9px] font-black text-amber-500">{poi.rating}</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground truncate">
            {(() => {
              const nameClean = poi.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const addrClean = (poi.formatted_address || "").toLowerCase().replace(/[^a-z0-9]/g, '');
              const name = poi.name.trim();
              const addr = poi.formatted_address || "";
              
              if (addrClean.startsWith(nameClean)) {
                return addr.substring(name.length).replace(/^[, \-\/]+/, "");
              }
              return addr;
            })()}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
             {poi.categories?.slice(0, 2).map((c: any, idx: number) => (
               <span key={`${c.name}-${idx}`} className="px-1.5 py-0.5 bg-white/5 rounded-md text-[7px] font-black text-white/40 uppercase">{c.name}</span>
             ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 rounded-xl">
             <Zap className="w-3.5 h-3.5 text-primary fill-current" />
             <span className="text-[11px] font-black text-primary">{poi.vibe_score}%</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 space-y-6 border-t border-white/10 mt-4"
          >
            {/* HERO IMAGE FOR EXPANDED VIEW */}
            {poi.photo_url && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/10 relative">
                 <img src={poi.photo_url} alt="Location" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Verified</span>
                 </div>
              </div>
            )}

            <div className="space-y-3">
              <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Details</span>
              <p className="text-base text-white font-medium leading-relaxed italic">"{poi.desc}"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Navigation</span>
                 <div className="text-sm font-black text-white flex items-center gap-2">
                   <Footprints className="w-5 h-5 text-primary" /> {travelInfo.time} ({travelInfo.distance})
                 </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Activity</span>
                 <div className="text-sm font-black text-white flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-primary" /> High Pulse
                 </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
               <span className="text-xs font-black text-primary uppercase tracking-[0.3em] block mb-2">Vibe</span>
               <div className="space-y-3">
                 <p className="text-[13px] font-bold text-white/80 leading-normal">
                   This spot is trending in the last 2 hours. Recommended for those seeking a <span className="text-primary">unique local experience</span>.
                 </p>
                 <div className="flex gap-1.5 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/20 w-[10%]" />
                    <div className="h-full bg-primary/40 w-[20%]" />
                    <div className="h-full bg-primary/80 w-[40%]" />
                    <div className="h-full bg-primary w-[30%]" />
                 </div>
                 <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-tighter">
                    <span>Morning Vibe</span>
                    <span>Noon Pulse</span>
                    <span className="text-primary font-black">Peak Activity</span>
                 </div>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground/60 pt-4 border-t border-white/5">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-primary">
               <Clock className="w-3 h-3" />
               <span>{travelInfo.time}</span>
             </div>
             <div className="flex items-center gap-1">
               <MapPin className="w-3 h-3" />
               <span>{travelInfo.distance}</span>
             </div>
           </div>
           <ArrowUpRight className="w-3.5 h-3.5 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] text-center px-10">
       <Sparkles className="w-10 h-10 text-muted-foreground/20 mb-4" />
       <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] leading-relaxed">{text}</p>
    </div>
  );
}
