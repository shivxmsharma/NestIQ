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
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      <MapIcon size={40} className="text-gray-300 animate-pulse" />
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
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); refine(e.target.value); }}
        placeholder="Search by locality, project or city…"
        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// ── Results count ─────────────────────────────────────────────────────────────
function ResultsStats() {
  const { results } = useInstantSearch();
  if (!results) return <span className="text-sm text-gray-400">Loading…</span>;
  return (
    <p className="text-gray-600 text-sm">
      <span className="font-semibold text-gray-900">
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
    buy: 'bg-emerald-600',
    rent: 'bg-indigo-600',
    pg: 'bg-violet-600',
  };

  return (
    <Link href={`/properties/${hit.objectID}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">

        {/* ── Image ── */}
        <div className="relative h-52 overflow-hidden shrink-0">
          {hit.coverPhoto ? (
            <Image
              src={hit.coverPhoto}
              alt={hit.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
              <MapPin size={40} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`${listingColors[hit.listingType] || 'bg-gray-600'} text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full`}>
              {hit.listingType === 'pg' ? 'PG' : hit.listingType}
            </span>
            {hit.isReraVerified && (
              <span className="bg-white/95 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <BadgeCheck size={11} /> RERA
              </span>
            )}
          </div>

          {/* Save */}
          <button
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow transition-all"
          >
            <Heart size={15} className={saved ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-4 flex flex-col flex-1">

          {/* Title + location */}
          <div>
            <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-1.5">
              {hit.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="line-clamp-1">{hit.locality}, {hit.city}</span>
            </p>
          </div>

          {/* Spacer — pushes specs + price to bottom */}
          <div className="flex-1" />

          {/* ── Specs row ── */}
          {(hit.bedrooms > 0 || hit.bathrooms > 0 || hit.area > 0) && (
            <div className="flex items-center gap-3 py-3 border-t border-slate-100 mt-3">
              {hit.bedrooms > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap">
                  <BedDouble size={13} className="text-slate-400 shrink-0" />
                  {hit.bedrooms} {hit.bedrooms === 1 ? 'Bed' : 'Beds'}
                </span>
              )}
              {hit.bathrooms > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap">
                  <Bath size={13} className="text-slate-400 shrink-0" />
                  {hit.bathrooms} {hit.bathrooms === 1 ? 'Bath' : 'Baths'}
                </span>
              )}
              {hit.area > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600 whitespace-nowrap">
                  <Maximize2 size={13} className="text-slate-400 shrink-0" />
                  {hit.area} sq.ft
                </span>
              )}
            </div>
          )}

          {/* ── Price + View ── */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              {formatPrice(hit.price, hit.listingType)}
            </span>
            <span className="bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col rounded-2xl h-[340px]">
            <div className="h-48 bg-slate-200" />
            <div className="p-4 flex-1 flex flex-col gap-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="mt-auto h-8 bg-slate-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
        <p className="text-gray-400 mb-6">
          Try adjusting your filters or search in a different area
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
    <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
      {/* Compact list */}
      <div className="w-72 flex-shrink-0 overflow-y-auto space-y-2 pr-1">
        {hits.length === 0 ? (
          <div className="text-center text-gray-400 pt-10 text-sm">
            No properties match your search
          </div>
        ) : (
          hits.map((hit) => (
            <Link
              key={hit.objectID}
              href={`/properties/${hit.objectID}`}
              className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3
                         hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {hit.coverPhoto && (
                  <Image src={hit.coverPhoto} alt="" fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 line-clamp-1
                              group-hover:text-blue-600 transition-colors">
                  {hit.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">📍 {hit.locality}</p>
                <p className="text-blue-600 font-bold text-sm mt-1">
                  {formatPrice(hit.price, hit.listingType)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Map */}
      <div className="flex-1">
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
    <div className="flex justify-center items-center gap-3 mt-10">
      <button
        onClick={() => refine(currentRefinement - 1)}
        disabled={isFirstPage}
        className="p-2 rounded-xl border border-gray-200 disabled:opacity-40
                   hover:bg-gray-50 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-gray-600">
        Page <span className="font-semibold">{currentRefinement + 1}</span> of{' '}
        <span className="font-semibold">{nbPages}</span>
      </span>
      <button
        onClick={() => refine(currentRefinement + 1)}
        disabled={isLastPage}
        className="p-2 rounded-xl border border-gray-200 disabled:opacity-40
                   hover:bg-gray-50 transition"
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
  const reraItem = rera.items.find((i) => i.label === 'true');

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white z-50 overflow-y-auto shadow-2xl p-5
        transform transition-transform duration-300
        lg:relative lg:w-auto lg:h-auto lg:shadow-none lg:p-0 lg:z-auto lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Mobile header */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <h2 className="font-bold text-lg">Filters</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="border bg-white border-gray-200 rounded-2xl p-4 space-y-5 min-w-[220px]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-blue-500" />
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filters</p>
          </div>

          {/* Property Type */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Property Type</p>
            <div className="flex flex-wrap gap-1.5">
              {propType.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => propType.refine(item.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${item.isRefined
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                  {item.label}
                  <span className="ml-1 opacity-50">({item.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bedrooms</p>
            <div className="flex gap-1.5 flex-wrap">
              {bedrooms.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => bedrooms.refine(item.value)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-colors ${item.isRefined
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Furnishing</p>
            <div className="space-y-1.5">
              {furnishing.items.map((item) => (
                <label key={item.label} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() => furnishing.refine(item.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-xs text-gray-400">({item.count})</span>
                </label>
              ))}
            </div>
          </div>

          {/* RERA */}
          {reraItem && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Verification</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reraItem.isRefined}
                  onChange={() => rera.refine(reraItem.value)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <BadgeCheck size={14} className="text-green-500" /> RERA Verified only
                </span>
              </label>
            </div>
          )}

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm
                         text-red-500 font-medium border border-red-200 rounded-xl
                         hover:bg-red-50 transition"
            >
              <X size={14} /> Clear all filters
            </button>
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

      <div className="min-h-screen bg-gray-50">

        {/* ── Sticky top bar ── */}
        <div className="bg-white border-b sticky top-16 z-30 shadow-sm top-bar">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between gap-4">

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border shrink-0
                          text-sm font-medium transition-all ${activeFilters > 0
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5
                                 flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="grow max-w-md">
              <SearchInput initialQuery={initialQuery} />
            </div>

            {/* Right Side Options */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Listing type tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
                {[null, ...LISTING_TYPES].map((type) => (
                  <button
                    key={type ?? 'all'}
                    onClick={() => setActiveType(type)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeType === type
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'}
                  </button>
                ))}
              </div>

              {/* Grid / Map toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  title="Map view"
                  className={`p-2 rounded-lg transition-all ${viewMode === 'map'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <MapIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 lg:px-0">

            {/* Desktop Filter Sidebar */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
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
              <div className="flex items-center justify-between mb-5">
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
