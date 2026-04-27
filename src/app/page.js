"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Shield, Zap, Star, ChevronRight,
  Bot, Sparkles, Building2, Users, BarChart3, ArrowRight,
  CheckCircle, MessageCircle, BadgeCheck, Home, TrendingUp,
  BedDouble, Bath, Maximize2, Globe, Play
} from "lucide-react";
import SafeImage from "../components/common/SafeImage";

const TABS = ["Buy", "Rent", "PG"];

const LOCALITIES = [
  {
    name: "Sector 17",
    tag: "City Centre",
    count: 124,
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  },
  {
    name: "Sector 35",
    tag: "IT Hub",
    count: 89,
    image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=600&q=80",
  },
  {
    name: "Mohali",
    tag: "Upcoming",
    count: 210,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    name: "Panchkula",
    tag: "Premium",
    count: 156,
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80",
  },
  {
    name: "Zirakpur",
    tag: "Affordable",
    count: 302,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    name: "Sector 7",
    tag: "Residential",
    count: 78,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  },
];

const WHY_NESTIQ = [
  {
    icon: Shield,
    title: "Trust Score on Every Listing",
    desc: "AI scans for fraud signals, verifies documents, and assigns a transparent trust score so you never get cheated.",
    accent: "indigo",
    tag: "Fraud Protection",
  },
  {
    icon: Bot,
    title: "AI Property Assistant",
    desc: "Describe your dream home in plain language and our AI instantly finds the best matches from thousands of listings.",
    accent: "purple",
    tag: "Powered by Nia",
  },
  {
    icon: Zap,
    title: "Hyper-local Intelligence",
    desc: "Get walkability scores, AQI data, school distances, and metro proximity right inside each listing page.",
    accent: "emerald",
    tag: "Neighbourhood Data",
  },
  {
    icon: Star,
    title: "Transparent Broker Ratings",
    desc: "Real ratings from real users. No ghost brokers, no fake leads. Every agent is verified and held accountable.",
    accent: "amber",
    tag: "Verified Agents",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Search & Discover",
    desc: "Use AI-powered search to find properties that match your exact needs — by locality, budget, or just a sentence.",
    color: "indigo",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Verify & Compare",
    desc: "Check trust scores, RERA status, and neighbourhood insights. Compare listings side-by-side with full transparency.",
    color: "purple",
  },
  {
    num: "03",
    icon: MessageCircle,
    title: "Connect & Close",
    desc: "Chat directly with verified owners or brokers. Schedule visits, negotiate, and close — all on NestIQ.",
    color: "emerald",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isSeller = ['seller', 'broker'].includes(session?.user?.role);
  const [activeTab, setActiveTab] = useState("Buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Fetch platform stats
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // Fetch 3 featured/recent properties for the homepage cards
  useEffect(() => {
    fetch("/api/properties?limit=3&status=active")
      .then((r) => r.json())
      .then((data) => {
        setFeaturedProperties(Array.isArray(data.properties) ? data.properties : []);
        setLoadingFeatured(false);
      })
      .catch(() => setLoadingFeatured(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing", activeTab.toLowerCase());
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    router.push(`/properties?${params.toString()}`);
  };

  const formatStat = (num) => {
    if (!num) return "0";
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
    return `${num}+`;
  };

  const formatPrice = (price, listingType) => {
    if (!price) return "Price on request";
    if (listingType === "rent" || listingType === "pg")
      return `₹${price.toLocaleString("en-IN")}/mo`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const STAT_ITEMS = [
    { label: "Active Listings", value: stats?.totalProperties, icon: Building2, color: "indigo" },
    { label: "Happy Users", value: stats?.totalUsers, icon: Users, color: "purple" },
    { label: "Verified Agents", value: stats?.verifiedBrokers, icon: BadgeCheck, color: "emerald" },
    { label: "Enquiries Made", value: stats?.totalEnquiries, icon: BarChart3, color: "amber" },
  ];

  return (
    <div className="relative overflow-x-hidden">
      
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-white overflow-hidden -mt-16">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <SafeImage
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85"
            alt="Luxury property background"
            fill
            unoptimized
            fallbackType="property"
            fallbackClassName="bg-[#070b14] text-slate-700"
            className="object-cover object-center scale-105"
            preload
          />
          {/* Multi-layer dark overlay for text readability */}
          <div className="absolute inset-0 bg-[#070b14]/60" />
          <div className="absolute inset-0 bg-linear-to-t from-[#070b14] via-[#070b14]/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#070b14]/30 via-transparent to-[#070b14]/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24">

          {/* Live badge */}
          <div className="inline-flex items-center justify-center gap-2 bg-white/8 backdrop-blur-xl border border-white/15 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full mb-8 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Now live in Chandigarh, Mohali & Panchkula
          </div>

          {/* Main Headline — Large, bold, two-line */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight mb-6 drop-shadow-2xl">
            Find your perfect
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-purple-300 to-indigo-400 mt-2">
              home in Tricity.
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            AI-powered search. Fraud-proof listings. Verified brokers.<br className="hidden sm:block" />
            The smarter way to find your future home.
          </p>

          {/* Omnisearch Card */}
          <div className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-3xl p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)] max-w-3xl mx-auto">

            {/* Buy / Rent / PG tabs */}
            <div className="flex gap-1 mb-3 px-1 pt-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search row */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 p-2 bg-black/30 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-2">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try '2BHK in Mohali under 50L'..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm sm:text-base font-medium"
                />
                <Sparkles className="w-4 h-4 text-indigo-400/70 hidden sm:block shrink-0" />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] shrink-0"
              >
                Search Properties
              </button>
            </form>
          </div>

          {/* Popular quick-links */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 mb-3">
            {["Sector 17", "Sector 35", "Mohali", "Zirakpur", "Panchkula"].map((loc) => (
              <button
                key={loc}
                onClick={() => setSearchQuery(loc)}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#070b14] to-transparent pointer-events-none z-0" />
      </section>

      {/* ── STATS STRIP ── */}
      <section className="relative z-20 py-0">
        <div className="border-t border-white/8 bg-[#070b14]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {STAT_ITEMS.map(({ label, value, icon: Icon, color }, i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center py-10 px-4 group relative
                    ${i < STAT_ITEMS.length - 1 ? "lg:border-r border-white/6" : ""}
                    ${i < 2 ? "border-b lg:border-b-0 border-white/6" : ""}
                  `}
                >
                  <div className={`text-${color}-400 mb-3 opacity-50 group-hover:opacity-100 transition-opacity duration-500`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 group-hover:scale-110 transition-transform duration-500">
                    {stats ? formatStat(value) : (
                      <div className="h-12 w-20 bg-white/5 rounded-xl animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <TrendingUp size={14} /> Fresh Listings
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Featured Properties
              </h2>
              <p className="text-slate-400 text-base mt-3 font-light">
                Hand-picked, verified listings fresh off the market
              </p>
            </div>
            <Link
              href="/properties"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 px-5 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 hover:border-indigo-500/40 transition-all shrink-0 group"
            >
              Browse all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingFeatured
              ? [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-[420px]">
                    <div className="h-56 bg-white/10" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                      <div className="h-3 bg-white/10 rounded w-1/3 mt-6" />
                      <div className="h-10 bg-white/10 rounded w-full mt-4" />
                    </div>
                  </div>
                ))
              : featuredProperties.slice(0, 3).map((property) => (
                  <Link
                    key={property._id}
                    href={`/properties/${property._id}`}
                    className="group bg-white/4 hover:bg-white/7 border border-white/8 hover:border-indigo-500/30 rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_20px_60px_rgba(79,70,229,0.15)] transition-all duration-500 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden shrink-0 bg-white/5">
                      {property.photos?.[0]?.url || property.coverPhoto ? (
                        <SafeImage
                          src={property.photos?.[0]?.url || property.coverPhoto}
                          alt={property.title || `${property.propertyType} in ${property.address?.locality || 'Unknown'}`}
                          fill
                          unoptimized
                          fallbackType="property"
                          fallbackClassName="bg-white/5 text-slate-600"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Building2 size={48} />
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-[#070b14]/80 via-transparent to-transparent" />

                      {/* Listing type badge */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border ${
                          property.listingType === 'buy' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          property.listingType === 'rent' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                          'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}>
                          {property.listingType === 'pg' ? 'PG' : property.listingType}
                        </span>
                        {property.isReraVerified && (
                          <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                            <BadgeCheck size={11} /> RERA
                          </span>
                        )}
                      </div>

                      {/* Price bottom-left on image */}
                      <div className="absolute bottom-4 left-4">
                        <p className="text-xl font-black text-white drop-shadow-lg">
                          {formatPrice(property.price, property.listingType)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-white text-[16px] leading-snug line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-[13px] text-slate-400 flex items-center gap-1.5 mb-4">
                        <MapPin size={13} className="text-indigo-400 shrink-0" />
                        <span className="line-clamp-1">
                          {property.address?.locality || property.locality}, {property.address?.city || property.city}
                        </span>
                      </p>

                      {/* Specs */}
                      {( (property.details?.bedrooms || property.bedrooms || 0) > 0 || (property.details?.area || property.area || 0) > 0) && (
                        <div className="flex items-center gap-4 text-[12px] text-slate-400 border-t border-white/8 pt-4 mt-auto">
                          {(property.details?.bedrooms || property.bedrooms || 0) > 0 && (
                            <span className="flex items-center gap-1.5">
                              <BedDouble size={13} className="text-indigo-400" />
                              {property.details?.bedrooms || property.bedrooms} Beds
                            </span>
                          )}
                          {(property.details?.bathrooms || property.bathrooms || 0) > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Bath size={13} className="text-indigo-400" />
                              {property.details?.bathrooms || property.bathrooms} Baths
                            </span>
                          )}
                          {(property.details?.area || property.area || 0) > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Maximize2 size={13} className="text-indigo-400" />
                              {property.details?.area || property.area} sq.ft
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── WHY NESTIQ ── */}
      <section className="py-24 relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Built different, for you
            </h2>
            <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto font-light">
              Every feature designed to eliminate the pain of real-estate hunting
            </p>
          </div>

          {/* Feature rows */}
          <div className="space-y-8">
            {WHY_NESTIQ.map(({ icon: Icon, title, desc, accent, tag }, index) => (
              <div
                key={title}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-center bg-white/3 border border-white/8 rounded-3xl overflow-hidden hover:border-white/15 hover:bg-white/5 transition-all duration-500 group`}
              >
                {/* Visual Panel */}
                <div className={`w-full md:w-2/5 shrink-0 flex items-center justify-center bg-${accent}-500/5 border-r border-white/5 min-h-[200px] relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-linear-to-br from-${accent}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className={`w-20 h-20 rounded-3xl bg-${accent}-500/15 border border-${accent}-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl relative z-10`}>
                    <Icon size={32} className={`text-${accent}-400`} />
                  </div>
                </div>

                {/* Text Panel */}
                <div className="flex-1 p-8 lg:p-10">
                  <span className={`inline-block text-[10px] font-bold text-${accent}-400 uppercase tracking-widest bg-${accent}-500/10 border border-${accent}-500/20 px-3 py-1 rounded-full mb-4`}>
                    {tag}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
                    {title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCALITIES ── */}
      <section className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Explore Neighbourhoods</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Popular localities
              </h2>
              <p className="text-slate-400 text-base mt-3 font-light">
                Tricity&apos;s most searched neighbourhoods
              </p>
            </div>
            <Link
              href="/properties"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 px-5 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 hover:border-indigo-500/40 transition-all shrink-0 group"
            >
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid: 3 col on desktop, 2 col tablet, 1 col mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LOCALITIES.map((loc) => (
              <Link
                key={loc.name}
                href={`/properties?q=${loc.name}`}
                className="relative h-56 rounded-3xl overflow-hidden group shadow-lg hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500"
              >
                {/* Real background image */}
                <SafeImage
                  src={loc.image}
                  alt={loc.name}
                  fill
                  unoptimized
                  fallbackType="property"
                  fallbackClassName="bg-white/5 text-slate-600"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#070b14]/90 via-[#070b14]/40 to-transparent" />
                <div className="absolute inset-0 bg-[#070b14]/20 group-hover:bg-transparent transition-colors duration-500" />

                {/* Content overlaid on image */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{loc.tag}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-1 group-hover:text-indigo-200 transition-colors">
                    {loc.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium">{loc.count} listings</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 relative z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              How NestIQ works
            </h2>
            <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto font-light">
              From first search to keys in hand — three effortless steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

            {/* Desktop connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px border-t-2 border-dashed border-white/10 z-0" />

            {STEPS.map(({ num, icon: Icon, title, desc, color }) => (
              <div
                key={num}
                className="relative bg-white/3 backdrop-blur-sm border border-white/8 rounded-3xl p-8 hover:bg-white/6 hover:border-white/15 transition-all duration-500 group z-10"
              >
                {/* Step number watermark */}
                <div className={`absolute top-4 right-6 text-8xl font-black text-${color}-500/10 select-none pointer-events-none group-hover:text-${color}-500/20 transition-colors duration-500`}>
                  {num}
                </div>

                {/* Icon circle */}
                <div className={`w-16 h-16 rounded-2xl bg-${color}-500/15 border border-${color}-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <Icon size={24} className={`text-${color}-400`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 tracking-tight relative z-10">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light relative z-10">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 pb-32 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10">

            {/* Animated gradient border glow */}
            <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 animate-pulse opacity-50 pointer-events-none" />

            {/* Background */}
            <div className="relative bg-[#0b1120]/95 backdrop-blur-2xl rounded-[2.5rem]">
              {/* Glows */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative grid grid-cols-1 lg:grid-cols-2">

                {/* Left — Buyer CTA */}
                <div className="px-10 py-16 lg:py-20 flex flex-col justify-center lg:border-r border-white/8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest mb-6 w-fit">
                    <Search size={13} /> Find your home
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                    Ready to find your{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-400">
                      dream home?
                    </span>
                  </h2>
                  <p className="text-slate-400 mb-8 text-lg font-light leading-relaxed">
                    Browse thousands of verified listings across the Tricity. Filter by budget, location, and lifestyle.
                  </p>
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:scale-105 w-fit text-base"
                  >
                    Start Exploring <ArrowRight size={18} />
                  </Link>
                </div>

                {/* Right — Seller CTA */}
                <div className="px-10 py-16 lg:py-20 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-300 uppercase tracking-widest mb-6 w-fit">
                    <Globe size={13} /> Zero brokerage for owners
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                    Own a property?{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-teal-400">
                      List it for free.
                    </span>
                  </h2>
                  <p className="text-slate-400 mb-8 text-lg font-light leading-relaxed">
                    Reach thousands of genuine buyers and tenants in Chandigarh, Mohali & Panchkula. No hidden charges.
                  </p>
                  {!session ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] text-base"
                      >
                        Create free account <ArrowRight size={18} />
                      </Link>
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center gap-2 bg-white/5 text-white font-semibold px-8 py-4 rounded-2xl border border-white/15 hover:bg-white/10 transition-all text-base"
                      >
                        Sign in
                      </Link>
                    </div>
                  ) : isSeller ? (
                    <Link
                      href="/dashboard/list-property"
                      className="inline-flex items-center gap-2 bg-white text-indigo-900 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] w-fit text-base"
                    >
                      List your property <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <Link
                      href="/properties"
                      className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl border border-white/15 hover:bg-white/15 transition-all w-fit text-base"
                    >
                      Browse properties <ArrowRight size={18} />
                    </Link>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
