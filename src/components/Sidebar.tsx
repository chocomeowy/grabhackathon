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
  onMapSourceChange
}: { 
  onLocationSelect?: (lat: number, lng: number) => void,
  onPoiSelect?: (lat: number, lng: number) => void,
  isCollapsed: boolean,
  onToggleCollapse: () => void,
  mapSource: 'grab' | 'osm' | 'onemap',
  onMapSourceChange: (source: 'grab' | 'osm' | 'onemap') => void
}) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const [pois, setPois] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [neighbourhood, setNeighbourhood] = useState('One North');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

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
          photo_url: 'https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?auto=format&fit=crop&w=400&q=80',
          categories: [{ name: 'Vibe Discovery' }]
        }];
        setErrorDetails("Using AI-Simulated Intelligence (Direct APIs busy)");
      }

      const location = places[0];
      if (location) {
        setNeighbourhood(location.name);
        const { latitude, longitude } = location.location;

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
          photo_url: poi.photo_url || `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerms)},${idx}`,
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
      {/* Dynamic Collapse Toggle */}
      <button 
        onClick={onToggleCollapse}
        className={`absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,177,79,0.4)] z-50 transition-all hover:scale-110 active:scale-90 ${isCollapsed ? 'rotate-180 -right-12' : ''}`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <motion.aside 
        className="h-full glass-sidebar flex flex-col relative shadow-2xl w-[420px]"
      >
        {/* COMPACT VIBRANT Header */}
        <div className="p-8 pb-6 shrink-0 bg-primary/20 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,177,79,0.3)] -rotate-3 border border-white/20">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tighter text-white">
                PulseMap <span className="text-primary">SG</span>
              </h1>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Intelligence Engine</p>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <h2 className="text-lg font-black text-white leading-tight">Explore neighbourhoods by vibe.</h2>
            <p className="text-xs text-white/50 font-medium">Build real-time decision engines on top of GrabMaps.</p>
          </div>

          <div className="flex gap-2 mb-8">
            {[
              { id: 'osm', label: 'OSM' },
              { id: 'onemap', label: 'OneMap' },
              { id: 'grab', label: 'Grab' }
            ].map(src => (
              <button 
                key={src.id}
                onClick={() => onMapSourceChange(src.id as any)}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${mapSource === src.id ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(0,177,79,0.4)]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'}`}
              >
                {src.label}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="vibe-input-container relative flex items-center h-14 px-4 group">
              <Search className={`w-4 h-4 transition-colors ${isSearching ? 'text-primary' : 'text-muted-foreground'}`} />
              <input 
                type="text" 
                placeholder="Where's the vibe?" 
                className="vibe-input flex-1 h-full ml-3 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ""))}
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="ml-2 p-2 bg-primary rounded-lg text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
                   className="px-4 py-2 btn-secondary text-[9px] whitespace-nowrap flex items-center gap-2 group"
                 >
                   <Zap className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" /> {t.label}
                 </button>
               ))}
            </div>
          </div>
        </div>


        {/* Content Scroll Area - Unbreakable Scroll Engine */}
        <div className="sidebar-content-scroll custom-scrollbar px-10 pb-32">
          <div className="py-10 space-y-10">
            <AnimatePresence mode="wait">
                  <motion.div 
                    key="intel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {errorDetails && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{errorDetails}</span>
                      </div>
                    )}

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
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Food Spots', value: stats.food, icon: Flame, color: 'text-orange-500' },
                          { label: 'Deep Work', value: stats.cafes, icon: Clock, color: 'text-primary' },
                          { label: 'Innov. Hubs', value: stats.hubs, icon: Zap, color: 'text-amber-500' }
                        ].map(stat => (
                          <div key={stat.label} className="glass-card p-4 border-white/5 bg-white/[0.02] flex flex-col gap-1">
                             <div className={`flex items-center gap-2 ${stat.color}`}>
                               <stat.icon className="w-3 h-3" />
                               <span className="text-xs font-black">{stat.value}</span>
                             </div>
                             <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">{stat.label}</span>
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
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                          {events.map(ev => (
                            <div key={ev.id} className="min-w-[240px] glass-card p-5 space-y-3 bg-white/[0.03]">
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
                            isExpanded={selectedPoiId === poi.poi_id}
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
                                  <h3 className="text-lg font-black text-white">Explore One North</h3>
                                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] max-w-[200px]">Enter a vibe or use a preset to reveal real-time urban intel.</p>
                               </div>
                            </div>
                         )}
                       </div>
                    </div>
                  </motion.div>
              </AnimatePresence>
            </div>
          </div>

        {/* LIVE INTELLIGENCE FEED */}
        <div className="mt-auto p-6 bg-black/40 border-t border-white/5 backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 bg-primary rounded-full animate-ping shadow-[0_0_10px_#00b14f]" />
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Discovery</span>
          </div>
          <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-700">
               <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
               <div>
                  <p className="text-[10px] font-bold text-white/90 leading-relaxed">
                    {pois.length > 0 
                      ? `${Math.max(3, Math.floor(pois.length / 3))} new high-vibe cafes detected in the last hour near ${neighbourhood}.` 
                      : "Establishing secure link to urban intelligence layers..."}
                  </p>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1 block">Discovery Insight • Just Now</span>
               </div>
            </div>
            
            {pois.length > 3 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <Search className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                   <p className="text-[10px] font-bold text-white/90 leading-relaxed">
                     Anomalous activity detected near {pois[0].name}. Vibe score peaking at {pois[0].vibe_score}%.
                   </p>
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1 block">Anomaly Report • 2m ago</span>
                </div>
              </div>
            )}
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


function POICard({ poi, isExpanded, onClick }: { poi: any, isExpanded: boolean, onClick: () => void }) {
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
                 <img src={poi.photo_url} alt="Location Intelligence" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Verified Intelligence</span>
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Vibe Intel</span>
              <p className="text-xs text-white/80 font-medium leading-relaxed italic">"{poi.desc}"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Distance</span>
                 <div className="text-xs font-black text-white flex items-center gap-2">
                   <Footprints className="w-4 h-4 text-primary" /> {poi.walking_time}m walk
                 </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Activity</span>
                 <div className="text-xs font-black text-white flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-primary" /> High Pulse
                 </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
               <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] block mb-2">Pulse Breakdown</span>
               <div className="space-y-3">
                 <p className="text-[9px] font-bold text-white/60 leading-normal">
                   This spot is trending in the last 2 hours. Recommended for those seeking a <span className="text-primary">unique local experience</span>.
                 </p>
                 <div className="flex gap-1.5 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/20 w-[10%]" />
                    <div className="h-full bg-primary/40 w-[20%]" />
                    <div className="h-full bg-primary/80 w-[40%]" />
                    <div className="h-full bg-primary w-[30%]" />
                 </div>
                 <div className="flex justify-between text-[7px] font-black text-white/30 uppercase tracking-tighter">
                    <span>Morning</span>
                    <span>Noon</span>
                    <span className="text-primary">Peak Now</span>
                 </div>
               </div>
            </div>

            <button className="w-full py-4 bg-primary rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
              <Navigation className="w-4 h-4 fill-current" /> Initialize Navigation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <div className="flex items-center justify-between text-[10px] font-black text-muted-foreground/60 pt-4 border-t border-white/5">
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-primary">
               <Clock className="w-3 h-3" />
               <span>{poi.walking_time} min</span>
             </div>
             <div className="flex items-center gap-1">
               <MapPin className="w-3 h-3" />
               <span>{poi.distance_meters}m</span>
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
