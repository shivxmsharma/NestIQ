'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  useSearchBox,
  useRefinementList,
  useHits,
  usePagination,
  useInstantSearch,
  Configure,
} from 'react-instantsearch';
import {
  Search, SlidersHorizontal, X,
  ChevronLeft, ChevronRight,
  MapPin, BadgeCheck, ArrowRight,
  Building2, Filter, LayoutGrid, Sparkles
} from 'lucide-react';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

const STATUS_COLORS = {
  "Upcoming": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "Under Construction": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Ready to Move": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Completed": "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

// ── Virtual Search Box (Syncs URL) ───────────────────────────────────────────
function VirtualSearchBox() {
  const { refine } = useSearchBox();
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.get('q');
    refine(q || '');
  }, [searchParams, refine]);
  return null;
}

// ── Custom Search Box ────────────────────────────────────────────────────────
function SearchBox() {
  const { query, refine } = useSearchBox();
  const [value, setValue] = useState(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    refine(value);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative group w-full max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 p-2 bg-white/8 backdrop-blur-2xl rounded-3xl border border-white/15 focus-within:border-indigo-500/50 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
    >
      <div className="flex-1 flex items-center gap-3 px-4 py-2">
        <Search className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors shrink-0" />
        <input
          type="text"
          placeholder="Try 'Villas in Mohali' or 'High-rise Projects'..."
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-base font-medium"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Sparkles className="w-4 h-4 text-indigo-400/50 hidden sm:block shrink-0" />
      </div>
      
      <button 
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-8 py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] shrink-0 active:scale-95"
      >
        Search Projects
      </button>

      {value && (
        <button 
          type="button"
          onClick={() => { setValue(''); refine(''); }} 
          className="absolute -right-12 inset-y-0 flex items-center px-3 hover:text-white text-slate-500 transition-colors sm:static sm:right-auto"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}

// ── Custom Refinement Dropdown/Chip ──────────────────────────────────────────
function CustomRefinementList({ attribute, title, placeholder }) {
  const { items, refine } = useRefinementList({ attribute, limit: 20 });
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  const refinedCount = items.filter(i => i.isRefined).length;

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 backdrop-blur-md ${
          refinedCount > 0 
            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
        }`}
      >
        <span>{title}</span>
        {refinedCount > 0 && <span className="bg-indigo-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{refinedCount}</span>}
        <ChevronLeft className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-3 z-50 w-64 bg-[#070b14] border border-white/15 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-4 backdrop-blur-3xl max-h-80 overflow-y-auto">
            <div className="space-y-1.5">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { refine(item.value); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                    item.isRefined 
                      ? 'bg-indigo-500/20 text-indigo-200 font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="text-[10px] font-bold opacity-40 ml-2">{item.count}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Hits Component ───────────────────────────────────────────────────────────
function ProjectHits() {
  const { hits } = useHits();
  const { results } = useInstantSearch();

  if (!results) return null;

  if (hits.length === 0) {
    return (
      <div className="py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem] backdrop-blur-sm">
        <Building2 className="mx-auto w-16 h-16 text-slate-700 mb-6 opacity-30" />
        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">No assets found</h3>
        <p className="text-slate-500 font-medium">Try adjusting your search filters or target location.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {hits.map((hit) => (
        <Link 
          key={hit.objectID} 
          href={`/builders/projects/${hit.slug}`}
          className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
        >
          <div className="h-60 relative overflow-hidden bg-white/5">
            {hit.coverImage ? (
              <Image 
                src={hit.coverImage} 
                alt={hit.title} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" 
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] to-transparent opacity-80" />
            
            <div className="absolute top-6 left-6">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-3xl shadow-2xl ${STATUS_COLORS[hit.status] || "bg-slate-500/20 text-slate-400"}`}>
                {hit.status}
              </span>
            </div>

            {hit.isFeatured && (
              <div className="absolute top-6 right-6">
                <span className="px-4 py-1.5 bg-indigo-600/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl border border-indigo-400/30 backdrop-blur-md flex items-center gap-1">
                   <Sparkles size={10} /> Featured
                </span>
              </div>
            )}
          </div>

          <div className="p-10 flex-grow flex flex-col">
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-indigo-400/10 rounded-md leading-none">{hit.projectType}</span>
                {hit.isReraVerified && (
                   <span className="text-emerald-400 text-[10px] font-black flex items-center gap-1.5 uppercase tracking-tighter">
                     <BadgeCheck size={14} className="drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" /> Verified
                   </span>
                )}
              </div>
              <h3 className="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-3 tracking-tighter leading-tight">
                {hit.title}
              </h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {hit.locality}, {hit.city}
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                {hit.priceMin ? (
                  <>
                    <span className="text-3xl font-black text-white tracking-tighter">
                      ₹{(hit.priceMin / 100000).toFixed(0)}L
                    </span>
                    {hit.priceMax > hit.priceMin && (
                      <span className="text-lg font-bold text-slate-500 tracking-tighter">
                        {" – "}₹{(hit.priceMax / 10000000).toFixed(2)}Cr+
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500 font-black italic text-xs uppercase tracking-widest">Price on Request</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none mb-1.5">Developer</p>
                  <p className="text-sm text-white font-black truncate leading-none tracking-tight">{hit.builderName}</p>
                </div>
              </div>
              <span className="w-12 h-12 rounded-[1rem] bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
                <ArrowRight size={20} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Pagination Component ─────────────────────────────────────────────────────
function Pagination() {
  const { currentRefinement, nbPages, refine } = usePagination();
  if (nbPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-6 mt-20">
      <button 
        onClick={() => refine(currentRefinement - 1)} 
        disabled={currentRefinement === 0}
        className="h-14 flex items-center gap-3 px-8 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group shadow-xl"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Previous
      </button>
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl text-sm font-black text-white shadow-2xl shadow-indigo-500/20">{currentRefinement + 1}</span>
        <span className="text-slate-700 font-black text-xl">/</span>
        <span className="text-slate-500 font-black text-xl">{nbPages}</span>
      </div>
      <button 
        onClick={() => refine(currentRefinement + 1)} 
        disabled={currentRefinement === nbPages - 1}
        className="h-14 flex items-center gap-3 px-8 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group shadow-xl"
      >
        Next <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

export default function AllProjectsPage() {
  return (
    <div className="min-h-screen bg-[#070b14] pb-32 relative text-slate-300">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '60px 60px' }} />

      <InstantSearch searchClient={searchClient} indexName="nestiq_projects" future={{ preserveSharedStateOnUnmount: true }}>
        <Configure hitsPerPage={12} />
        <VirtualSearchBox />

        {/* Hero Section */}
        <div className="relative overflow-hidden pt-24 pb-28">
          {/* Background Blobs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -translate-y-1/2 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070b14] to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-10 shadow-2xl">
              <Sparkles size={14} className="animate-pulse" /> Global Asset Inventory
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
              Explore New <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400">Launches</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Curated architectural marvels and high-yield commercial assets from the most respected developers in the Tricity region.
            </p>
          </div>
        </div>

        {/* Search & Filter Section (Directly integrated) */}
        <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-30 space-y-12">
          {/* Search Row */}
          <SearchBox />

          {/* Filter Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
             <div className="flex items-center gap-2.5 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-white/3 rounded-full border border-white/5 shrink-0">
               <Filter size={12} /> Optimization
             </div>
             <CustomRefinementList attribute="city" title="Location" />
             <CustomRefinementList attribute="status" title="Timeline" />
             <CustomRefinementList attribute="projectType" title="Asset Type" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-16 relative z-10">
          <ProjectHits />
          <Pagination />
        </div>
      </InstantSearch>
    </div>
  );
}
