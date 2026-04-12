'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
  MapPin, BedDouble, Bath, Maximize2,
  Heart, BadgeCheck, Map as MapIcon, Grid3X3,
} from 'lucide-react';

const PropertyMap = dynamic(() => import('../../components/map/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
      <MapIcon size={40} className="text-slate-600 animate-pulse" />
    </div>
  ),
});

// ── Algolia client ────────────────────────────────────────────────────────────
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (price, listingType) => {
  if (!price) return 'Price on request';
  if (listingType === 'rent' || listingType === 'pg')
    return `₹${price.toLocaleString('en-IN')}/mo`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const LISTING_TYPES = ['buy', 'rent', 'pg'];

// ── Search input ──────────────────────────────────────────────────────────────
function SearchInput({ initialQuery }) {
  const { query, refine } = useSearchBox();
  const [value, setValue] = useState(initialQuery || query);

  useEffect(() => {
    if (initialQuery && !query) {
      refine(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, refine]);

  return (
    <div className="flex-1 relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); refine(e.target.value); }}
        placeholder="Search by locality, project or city…"
        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
      />
    </div>
  );
}

// ── Results count ─────────────────────────────────────────────────────────────
function ResultsStats() {
  const { results } = useInstantSearch();
  if (!results) return <span className="text-sm text-slate-400">Loading…</span>;
  return (
    <p className="text-slate-400 text-sm">
      <span className="font-semibold text-white">
        {results.nbHits.toLocaleString()}
      </span>{' '}
      properties found
    </p>
  );
}

// ── Property card (Algolia hit) ───────────────────────────────────────────────
function HitCard({ hit }) {
  const [saved, setSaved] = useState(false);

  const listingColors = {
    buy: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    rent: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    pg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  };

  return (
    <Link href={`/properties/${hit.objectID}`} className="group block h-full">
      <div className="bg-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col backdrop-blur-sm">

        {/* ── Image ── */}
        <div className="relative h-52 overflow-hidden shrink-0">
          {hit.coverPhoto ? (
            <Image
              src={hit.coverPhoto}
              alt={hit.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-600">
              <MapPin size={40} />
            </div>
          )}
          
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`${listingColors[hit.listingType] || 'bg-slate-500/20 text-slate-300 border border-slate-500/30'} text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md`}>
              {hit.listingType === 'pg' ? 'PG' : hit.listingType}
            </span>
            {hit.isReraVerified && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-md">
                <BadgeCheck size={12} /> RERA
              </span>
            )}
          </div>

          {/* Save */}
          <button
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full shadow transition-all border border-white/10 hover:border-white/20"
          >
            <Heart size={16} className={saved ? 'fill-rose-500 text-rose-500' : 'text-white'} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-5 flex flex-col flex-1">

          {/* Title + location */}
          <div>
            <h3 className="font-semibold text-white text-[15px] leading-snug line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
              {hit.title}
            </h3>
            <p className="text-[13px] text-slate-400 font-medium flex items-center gap-1.5">
              <MapPin size={14} className="text-indigo-400 shrink-0" />
              <span className="line-clamp-1">{hit.locality}, {hit.city}</span>
            </p>
          </div>

          {/* Spacer — pushes specs + price to bottom */}
          <div className="flex-1" />

          {/* ── Specs row ── */}
          {(hit.bedrooms > 0 || hit.bathrooms > 0 || hit.area > 0) && (
            <div className="flex items-center justify-between py-3.5 border-t border-white/10 mt-4">
              <div className="flex items-center gap-3">
                {hit.bedrooms > 0 && (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 whitespace-nowrap">
                    <BedDouble size={14} className="text-indigo-400 shrink-0" />
                    {hit.bedrooms} {hit.bedrooms === 1 ? 'Bed' : 'Beds'}
                  </span>
                )}
                {hit.bathrooms > 0 && (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 whitespace-nowrap">
                    <Bath size={14} className="text-indigo-400 shrink-0" />
                    {hit.bathrooms} {hit.bathrooms === 1 ? 'Bath' : 'Baths'}
                  </span>
                )}
                {hit.area > 0 && (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300 whitespace-nowrap">
                    <Maximize2 size={14} className="text-indigo-400 shrink-0" />
                    {hit.area} sq.ft
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Price + View ── */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-[22px] font-bold text-white tracking-tight">
              {formatPrice(hit.price, hit.listingType)}
            </span>
            <span className="bg-indigo-500/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white border border-indigo-500/20 group-hover:border-indigo-500 text-[13px] font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0)] group-hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              View
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
}

// ── Grid of hits ──────────────────────────────────────────────────────────────
function HitsGrid() {
  const { hits } = useHits();
  const { status } = useInstantSearch();

  // Skeleton Loader for Global Polish
  if (status === 'stalled' || status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 overflow-hidden flex flex-col rounded-2xl h-[380px] backdrop-blur-sm">
            <div className="h-52 bg-white/10" />
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
              <div className="mt-auto h-10 bg-white/10 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
        <div className="text-6xl mb-4 opacity-80">🌌</div>
        <h3 className="text-xl font-semibold text-white mb-2">No properties found</h3>
        <p className="text-slate-400 mb-6">
          Try adjusting your filters or search in a different sector
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {hits.map((hit) => (
        <HitCard key={hit.objectID} hit={hit} />
      ))}
    </div>
  );
}

// ── Map layout ────────────────────────────────────────────────────────────────
function MapLayout() {
  const { hits } = useHits();

  return (
    <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Compact list */}
      <div className="w-80 flex-shrink-0 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {hits.length === 0 ? (
          <div className="text-center text-slate-400 pt-10 text-sm">
            No properties match your search
          </div>
        ) : (
          hits.map((hit) => (
            <Link
              key={hit.objectID}
              href={`/properties/${hit.objectID}`}
              className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 hover:border-indigo-400/30 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                {hit.coverPhoto ? (
                  <Image src={hit.coverPhoto} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin size={24} className="text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-[13px] font-semibold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                  {hit.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin size={10} className="text-indigo-400" />
                  <span className="line-clamp-1">{hit.locality}</span>
                </p>
                <p className="text-indigo-300 font-bold text-[13px] mt-1.5">
                  {formatPrice(hit.price, hit.listingType)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-[#0b1120]/50">
        <PropertyMap hits={hits} />
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function PaginationBar() {
  const { currentRefinement, nbPages, refine, isFirstPage, isLastPage } = usePagination();
  if (nbPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-12">
      <button
        onClick={() => refine(currentRefinement - 1)}
        disabled={isFirstPage}
        className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:bg-transparent hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-slate-400 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
        Page <span className="font-semibold text-white">{currentRefinement + 1}</span> of{' '}
        <span className="font-semibold text-white">{nbPages}</span>
      </span>
      <button
        onClick={() => refine(currentRefinement + 1)}
        disabled={isLastPage}
        className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white disabled:opacity-40 disabled:bg-transparent hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────────────
function FilterPanel({ open, onClose, activeCount, onClear }) {
  const propType = useRefinementList({ attribute: 'propertyType' });
  const bedrooms = useRefinementList({ attribute: 'bedrooms' });
  const furnishing = useRefinementList({ attribute: 'furnishing' });
  const rera = useRefinementList({ attribute: 'isReraVerified' });
  const reraItem = rera.items.find((i) => i.label === 'true' || i.label === true);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-[#0b1120]/80 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <div className={`
        fixed top-0 left-0 h-full w-80 bg-[#0b1120] lg:bg-transparent z-50 overflow-y-auto p-5
        transform transition-transform duration-500 ease-out
        lg:relative lg:w-auto lg:h-auto lg:p-0 lg:z-auto lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Mobile header */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="font-bold text-xl text-white">Filters</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full border border-white/10 text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 space-y-6 min-w-[240px] shadow-lg">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10">
            <SlidersHorizontal size={16} className="text-indigo-400" />
            <p className="text-sm font-bold text-white uppercase tracking-wider">Filters</p>
          </div>

          {/* Property Type */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Property Type</p>
            <div className="flex flex-wrap gap-2">
              {propType.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => propType.refine(item.value)}
                  className={`text-[13px] px-3.5 py-1.5 rounded-xl border font-medium transition-all duration-300 ${item.isRefined
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.2)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/50 hover:bg-white/10'
                    }`}
                >
                  {item.label}
                  <span className="ml-1.5 text-[10px] opacity-60">({item.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Bedrooms</p>
            <div className="flex gap-2 flex-wrap">
              {bedrooms.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => bedrooms.refine(item.value)}
                  className={`w-11 h-11 rounded-xl text-[15px] font-semibold border transition-all duration-300 flex items-center justify-center ${item.isRefined
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.2)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/50 hover:bg-white/10'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Furnishing</p>
            <div className="space-y-2.5">
              {furnishing.items.map((item) => (
                <label key={item.label} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={item.isRefined}
                      onChange={() => furnishing.refine(item.value)}
                      className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
                    />
                    <svg className="absolute w-3.5 h-3.5 left-[3px] pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
                  </div>
                  <span className="text-[14px] text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                  <span className="text-[11px] text-slate-500 ml-auto bg-white/5 px-2 py-0.5 rounded-md">({item.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* RERA */}
          {reraItem && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Verification</p>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={reraItem.isRefined}
                    onChange={() => rera.refine(reraItem.value)}
                    className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                  />
                  <svg className="absolute w-3.5 h-3.5 left-[3px] pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
                </div>
                <span className="text-[14px] text-slate-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                  <BadgeCheck size={16} className="text-emerald-400" /> RERA Verified
                </span>
              </label>
            </div>
          )}

          {/* Clear */}
          {activeCount > 0 && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] text-rose-400 font-semibold border border-rose-500/30 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
              >
                <X size={15} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const urlListingType = searchParams.get('listing') || null;

  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Use URL param as the absolute source of truth if it exists, otherwise manual interaction rules
  const [localActiveType, setLocalActiveType] = useState(urlListingType);
  const [lastUrlType, setLastUrlType] = useState(urlListingType);

  // If the user clicks a navbar link (URL changes), sync the local state WITHOUT throwing an effect error
  if (urlListingType !== lastUrlType) {
    setLocalActiveType(urlListingType);
    setLastUrlType(urlListingType);
  }

  // To maintain compatibility with page's Tab switch buttons
  const activeType = localActiveType;
  const setActiveType = setLocalActiveType;

  const filters = activeType
    ? `listingType:${activeType} AND status:active`
    : 'status:active';

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="nestiq_properties"
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Configure filters={filters} hitsPerPage={viewMode === 'map' ? 50 : 12} />

      <div className="min-h-screen relative z-10 w-full pb-20">

        {/* ── Sticky top bar ── */}
        <div className="bg-[#0b1120]/80 backdrop-blur-2xl border-b border-white/10 sticky top-16 z-30 shadow-lg top-bar">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4">

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border shrink-0 text-sm font-semibold transition-all duration-300 ${activeFilters > 0
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="grow max-w-xl">
              <SearchInput initialQuery={initialQuery} />
            </div>

            {/* Right Side Options */}
            <div className="hidden lg:flex items-center gap-5">
              {/* Listing type tabs */}
              <div className="flex bg-white/5 border border-white/10 rounded-[14px] p-1 gap-1 flex-shrink-0 backdrop-blur-sm">
                {[null, ...LISTING_TYPES].map((type) => (
                  <button
                    key={type ?? 'all'}
                    onClick={() => setActiveType(type)}
                    className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-300 ${activeType === type
                      ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
                  </button>
                ))}
              </div>

              {/* Grid / Map toggle */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-[14px] p-1 flex-shrink-0 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'grid'
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  title="Map view"
                  className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === 'map'
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <MapIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 relative">
          {/* Background Ambient Glow beneath content */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 lg:px-0 relative z-10">

            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-[120px]">
                <FilterPanel
                  open={false}
                  onClose={() => { }}
                  activeCount={activeFilters}
                  onClear={() => setActiveFilters(0)}
                />
              </div>
            </div>

            {/* Mobile filter panel — slide-in */}
            <div className="lg:hidden">
              <FilterPanel
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                activeCount={activeFilters}
                onClear={() => setActiveFilters(0)}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <ResultsStats />
              </div>

              {viewMode === 'grid' ? (
                <>
                  <HitsGrid />
                  <PaginationBar />
                </>
              ) : (
                <MapLayout />
              )}
            </div>
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}
