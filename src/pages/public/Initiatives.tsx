import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowRight, Search, Users, Star, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../lib/utils';

const Initiatives = () => {
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { socket } = useSocket();

  useEffect(() => {
    fetch('/api/initiatives')
      .then(res => res.json())
      .then(data => setInitiatives(Array.isArray(data) ? data : []))
      .catch(() => setInitiatives([]));

    if (socket) {
      socket.on('initiative:new', (newInit: any) => {
        const newId = newInit?.id || newInit?._id;
        setInitiatives(prev => {
          if (newId && prev.some(p => (p.id || p._id) === newId)) return prev;
          return [newInit, ...prev];
        });
      });
    }

    return () => {
      if (socket) socket.off('initiative:new');
    };
  }, [socket]);

  const categories = ['All', 'Environment', 'Education', 'Infrastructure', 'Life', 'Food', 'Health'];

  const searchLower = search.trim().toLowerCase();
  const filtered = initiatives.filter(i => 
    (filter === 'All' || i.category === filter) &&
    ((i.title || '').toLowerCase().includes(searchLower) || (i.city || '').toLowerCase().includes(searchLower) || (i.category || '').toLowerCase().includes(searchLower))
  );

  const featured = initiatives[0];
  const featuredId = featured?.id || featured?._id;

  return (
    <div className="min-h-screen bg-pearl pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="pill-outline border-slate-900 mb-8">The Collective Network</span>
            <h1 className="text-7xl md:text-9xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
              Catalyzing <br /> Local <span className="italic text-slate-400">Evolution.</span>
            </h1>
            <p className="text-2xl text-slate-500 font-display font-light leading-relaxed max-w-2xl">
              Join a global movement of sovereign citizens reclaiming their communities through transparent, decentralized action.
            </p>
          </motion.div>
        </div>

        {/* Featured Hero */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[650px] rounded-[4rem] overflow-hidden mb-32 group shadow-2xl border border-slate-100"
          >
            <img 
              src={`https://picsum.photos/seed/${featuredId}/1920/1080`} 
              alt={featured.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-16 left-16 right-16 flex flex-col md:flex-row justify-between items-end gap-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 text-prospera-blue mb-6">
                  <Star size={18} fill="currentColor" />
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Featured Initiative</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-8 leading-tight tracking-tight">
                  {featured.title}
                </h2>
                <div className="flex items-center gap-10 text-white/60 text-xs uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-prospera-blue" />
                    {featured.city}
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-prospera-blue" />
                    {featured.volunteers?.length || 12} Active Members
                  </div>
                </div>
              </div>
              <Link to={`/initiatives/${featuredId}`}>
                <button className="bg-white text-slate-900 px-12 py-6 rounded-full font-display font-bold text-sm hover:bg-prospera-blue hover:text-white transition-all shadow-2xl flex items-center gap-4 group/btn">
                  Explore Project <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white/50 backdrop-blur-xl border border-slate-100 p-4 rounded-[2.5rem] mb-20 shadow-sm flex flex-col lg:flex-row items-center gap-6">
          <form onSubmit={(e) => e.preventDefault()} className="relative flex-1 w-full group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-prospera-blue transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search initiatives, cities, or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-20 pr-40 py-6 rounded-full bg-white border border-slate-50 focus:outline-none focus:ring-2 focus:ring-prospera-blue/10 transition-all text-slate-900 placeholder:text-slate-300 font-display"
            />
            <button 
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-display font-bold text-xs uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl"
            >
              Search
            </button>
          </form>
          
          <div className="flex items-center gap-4 px-4 border-l border-slate-100">
            <Link to="/start">
              <button className="bg-prospera-blue text-white px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                Start Action <ArrowRight size={14} />
              </button>
            </Link>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl ml-4">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  viewMode === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-12 no-scrollbar mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap border",
                filter === cat 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={cn(
          "grid gap-12",
          viewMode === 'grid' ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const itemId = item.id || item._id;
              return (
              <motion.div
                key={itemId}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "group prospera-card overflow-hidden transition-all duration-700",
                  viewMode === 'list' && "flex flex-col md:flex-row"
                )}
              >
                <div className={cn(
                  "overflow-hidden relative",
                  viewMode === 'grid' ? "aspect-[16/11]" : "md:w-1/3 aspect-video md:aspect-auto"
                )}>
                  <img 
                    src={`https://picsum.photos/seed/${itemId}/800/600`} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-8 left-8">
                    <span className="pill-outline bg-white/90 border-transparent">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className={cn(
                  "p-10 flex flex-col",
                  viewMode === 'list' && "flex-1 justify-center"
                )}>
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 font-display">
                    <MapPin size={14} className="text-prospera-blue" />
                    {item.city}
                  </div>
                  <h3 className="text-3xl font-display font-medium text-slate-900 mb-6 group-hover:text-prospera-blue transition-colors leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-500 text-base font-display font-light mb-10 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-10 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-xl font-display font-light text-slate-900">{item.volunteers?.length || 12}</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 font-display">Volunteers</span>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="text-xl font-display font-light text-slate-900">85%</span>
                        <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 font-display">Progress</span>
                      </div>
                    </div>
                    <Link to={`/initiatives/${itemId}`}>
                      <button className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <ArrowRight size={20} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-48"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-display font-light text-2xl">No initiatives found matching your criteria.</p>
            <button 
              onClick={() => {setFilter('All'); setSearch('');}}
              className="mt-8 text-prospera-blue font-display font-bold uppercase tracking-widest text-[10px] hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Initiatives;
