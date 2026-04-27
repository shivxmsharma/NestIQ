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

// ── Virtual Search Box (Syncs URL with Algolia) ─────────────────────────────
function VirtualSearchBox() {
  const { refine } = useSearchBox();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    refine(q || '');
  }, [searchParams, refine]);

  return null;
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
          <div className="absolute inset-0 bg-linear-to-t from-[#0b1120] via-transparent to-transparent opacity-60" />

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
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 overflow-hidden flex flex-col rounded-2xl h-95 backdrop-blur-sm">
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
    <div className="flex gap-5 h-[calc(100vh-220px)] min-h-125">
      {/* Compact list */}
      <div className="w-80 shrink-0 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
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
              <div className="relative w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-white/5">
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
function FilterBar({ activeCount, onClear }) {
  const propType = useRefinementList({ attribute: 'propertyType' });
  const bedrooms = useRefinementList({ attribute: 'bedrooms' });
  const rera = useRefinementList({ attribute: 'isReraVerified' });
  const reraItem = rera.items.find((i) => i.label === 'true' || i.label === true);

  return (
    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar w-full">

      {/* Left: Filters — centered */}
      <div className="flex flex-1 justify-start lg:justify-center items-center gap-3 overflow-x-auto hide-scrollbar">

        {/* Property Type */}
        <div className="flex shrink-0 items-center gap-2">
          {propType.items.map((item) => (
            <button
              key={item.label}
              onClick={() => propType.refine(item.value)}
              className={`text-[12px] px-3.5 py-1.5 rounded-full border font-medium transition-all whitespace-nowrap ${item.isRefined
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/10 shrink-0" />

        {/* Bedrooms */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-500 hidden sm:block">Beds</span>
          {bedrooms.items.map((item) => (
            <button
              key={item.label}
              onClick={() => bedrooms.refine(item.value)}
              className={`w-8 h-8 rounded-full text-[13px] font-semibold border transition-all flex items-center justify-center shrink-0 ${item.isRefined
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/10 shrink-0" />

        {/* RERA */}
        {reraItem && (
          <button
            onClick={() => rera.refine(reraItem.value)}
            className={`flex items-center gap-1.5 text-[12px] px-3.5 py-1.5 rounded-full border font-medium transition-all shrink-0 ${reraItem.isRefined
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
              }`}
          >
            <BadgeCheck size={14} className={reraItem.isRefined ? 'text-emerald-400' : 'text-slate-400'} />
            RERA
          </button>
        )}

        {/* Clear */}
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Right: Results count */}
      <ResultsStats />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const urlListingType = searchParams.get('listing') || null;

  const [viewMode, setViewMode] = useState('grid');
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
      <Configure filters={filters} hitsPerPage={viewMode === 'map' ? 50 : 16} />
      <VirtualSearchBox />

      <div className="min-h-screen relative w-full bg-[#0b1120] pb-32 overflow-x-hidden text-slate-300">

        {/* ── Filter Toolbar ── */}
        <div className="sticky top-0 z-30 w-full bg-[#0b1120]/95 backdrop-blur-3xl border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <FilterBar
              activeCount={activeFilters}
              onClear={() => setActiveFilters(0)}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">

          {/* Ambient Glows */}
          <div className="fixed top-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-0 w-125 h-125 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {viewMode === 'grid' ? (
            <>
              <HitsGrid />
              <PaginationBar />
            </>
          ) : (
            <MapLayout />
          )}

        </div>

        {/* ── Floating Map/List Toggle (FAB) ── */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)] hover:-translate-y-1 transition-all duration-300 border border-white/10"
          >
            {viewMode === 'grid' ? (
              <>
                Show Map <MapIcon size={16} />
              </>
            ) : (
              <>
                Show List <Grid3X3 size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </InstantSearch>
  );
}
