"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Shield, Zap, Star,
  ChevronRight, Bot, Sparkles, Building2,
  Users, BarChart3, Globe, ArrowRight,
  CheckCircle, MessageCircle, Eye
} from "lucide-react";

const TABS = ["Buy", "Rent", "PG"];

const LOCALITIES = [
  { name: "Sector 17", tag: "City Centre", count: 124, gradient: "from-indigo-500/20 to-purple-500/10" },
  { name: "Sector 35", tag: "IT Hub", count: 89, gradient: "from-blue-500/20 to-indigo-500/10" },
  { name: "Mohali", tag: "Upcoming", count: 210, gradient: "from-emerald-500/20 to-teal-500/10" },
  { name: "Panchkula", tag: "Premium", count: 156, gradient: "from-amber-500/20 to-orange-500/10" },
  { name: "Zirakpur", tag: "Affordable", count: 302, gradient: "from-rose-500/20 to-pink-500/10" },
  { name: "Sector 7", tag: "Residential", count: 78, gradient: "from-purple-500/20 to-violet-500/10" },
];

const WHY_NESTIQ = [
  {
    icon: Shield,
    title: "Trust Score on Every Listing",
    desc: "AI scans for fraud signals, verifies documents, and assigns a transparent trust score so you never get cheated.",
    accent: "indigo",
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
    iconColor: "text-indigo-400",
    hoverBorder: "hover:border-indigo-500/40",
  },
  {
    icon: Bot,
    title: "AI Property Assistant",
    desc: "Describe your dream home in plain language and our AI instantly finds the best matches from thousands of listings.",
    accent: "purple",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconColor: "text-purple-400",
    hoverBorder: "hover:border-purple-500/40",
  },
  {
    icon: Zap,
    title: "Hyper-local Intelligence",
    desc: "Get walkability scores, AQI data, school distances, and metro proximity right inside each listing page.",
    accent: "emerald",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/40",
  },
  {
    icon: Star,
    title: "Transparent Broker Ratings",
    desc: "Real ratings from real users. No ghost brokers, no fake leads. Every agent is verified and held accountable.",
    accent: "amber",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconColor: "text-amber-400",
    hoverBorder: "hover:border-amber-500/40",
  },
];

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Search & Discover",
    desc: "Use AI-powered search to find properties that match your exact needs — by locality, budget, or just a sentence.",
    accent: "indigo",
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
    iconColor: "text-indigo-400",
    numColor: "text-indigo-500/30",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Verify & Compare",
    desc: "Check trust scores, RERA status, and neighbourhood insights. Compare listings side-by-side with full transparency.",
    accent: "purple",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconColor: "text-purple-400",
    numColor: "text-purple-500/30",
  },
  {
    num: "03",
    icon: MessageCircle,
    title: "Connect & Close",
    desc: "Chat directly with verified owners or brokers. Schedule visits, negotiate, and close — all on NestIQ.",
    accent: "emerald",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
    numColor: "text-emerald-500/30",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isSeller = ['seller', 'broker'].includes(session?.user?.role);
  const [activeTab, setActiveTab] = useState("Buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
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

  const STAT_ITEMS = [
    { label: "Active Listings", value: stats?.totalProperties, icon: Building2, color: "text-indigo-400" },
    { label: "Happy Users", value: stats?.totalUsers, icon: Users, color: "text-purple-400" },
    { label: "Verified Agents", value: stats?.verifiedBrokers, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Enquiries Made", value: stats?.totalEnquiries, icon: BarChart3, color: "text-amber-400" },
  ];

  return (
    <div className="relative">
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* —— Hero Section —— */}
        <section className="relative min-h-[85vh] flex flex-col justify-center text-white overflow-hidden pb-20 pt-32">
          <div className="max-w-4xl mx-auto text-center">

            {/* Micro Badge */}
            <div className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full mb-8 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Now live in Chandigarh, Mohali &amp; Panchkula
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight drop-shadow-2xl">
              Find your perfect
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-yellow-100 via-amber-200 to-yellow-500 mt-2 pb-2">
                home in the tricity.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light drop-shadow-md">
              AI-powered search. Fraud-proof listings. Verified brokers. The smarter way to find your future home.
            </p>

            {/* Glassmorphic Omnisearch */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-4xl p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-3xl mx-auto">
              
              {/* Type Tabs */}
              <div className="flex justify-start gap-2 mb-3 px-3 pt-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab
                      ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                      : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white/95 rounded-3xl px-6 py-4 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/30 transition-all shadow-inner">
                  <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search '2BHK in Mohali under 50L'..."
                    className="flex-1 bg-transparent text-slate-900 placeholder-slate-500 outline-none text-base sm:text-lg font-semibold"
                  />
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-3 h-3" /> AI
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold px-8 py-4 rounded-3xl transition-all shadow-[0_0_25px_rgba(99,102,241,0.4)] shrink-0"
                >
                  Find Property
                </button>
              </form>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {["Sector 17", "Mohali", "Zirakpur", "Panchkula", "Sector 35"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSearchQuery(loc)}
                  className="text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2 rounded-full transition-all"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — Social Proof Stats Strip
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-6 relative z-20">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Subtle gradient line at top */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
              {STAT_ITEMS.map(({ label, value, icon: Icon, color }, i) => (
                <div
                  key={label}
                  className={`relative flex flex-col items-center py-10 px-4 group ${
                    i < STAT_ITEMS.length - 1 ? "lg:border-r border-white/5" : ""
                  } ${i < 2 ? "border-b lg:border-b-0 border-white/5" : ""}`}
                >
                  <div className={`mb-3 ${color} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}>
                    <Icon size={22} />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2 group-hover:scale-105 transition-transform duration-500">
                    {stats ? formatStat(value) : (
                      <div className="h-12 w-20 bg-white/5 rounded-xl animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide uppercase">{label}</p>

                  {/* Hover glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-radial-[ellipse_at_center] ${
                    color.replace("text-", "from-").replace("400", "500/10")
                  } from-10% to-transparent to-70%`} />
                </div>
              ))}
            </div>

            {/* Subtle gradient line at bottom */}
            <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — How It Works
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 relative z-20">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              How NestIQ works
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-xl mx-auto font-light">
              From search to keys in hand — three simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto relative">
            {/* Connector lines (desktop only) */}
            <div className="hidden md:block absolute top-24 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px border-t-2 border-dashed border-white/10" />

            {STEPS.map(({ num, icon: Icon, title, desc, iconBg, iconColor, numColor }) => (
              <div
                key={num}
                className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 lg:p-10 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 group"
              >
                {/* Step number watermark */}
                <div className={`absolute top-6 right-8 text-7xl font-black ${numColor} select-none pointer-events-none group-hover:scale-110 transition-transform duration-500`}>
                  {num}
                </div>

                {/* Icon */}
                <div className={`relative z-10 w-14 h-14 rounded-2xl ${iconBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <Icon size={22} className={iconColor} />
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
                <p className="relative z-10 text-sm text-slate-400 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — Why NestIQ (Feature Cards)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 relative z-20">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Built different, for you
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-xl mx-auto font-light">
              Every feature designed to eliminate the pain of property hunting
            </p>
          </div>

          {/* 2×2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {WHY_NESTIQ.map(({ icon: Icon, title, desc, gradient, iconBg, iconColor, hoverBorder }) => (
              <div
                key={title}
                className={`relative overflow-hidden bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 lg:p-10 ${hoverBorder} hover:bg-white/[0.05] transition-all duration-500 group`}
              >
                {/* Background gradient accent */}
                <div className={`absolute top-0 left-0 w-full h-full bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                {/* Icon */}
                <div className={`relative z-10 w-14 h-14 rounded-2xl ${iconBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <Icon size={22} className={iconColor} />
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-xl font-bold text-white mb-3 tracking-tight group-hover:translate-x-1 transition-transform duration-500">{title}</h3>
                <p className="relative z-10 text-sm text-slate-400 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — Popular Localities
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 relative z-20">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Explore Neighbourhoods</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Popular localities
              </h2>
              <p className="text-slate-400 text-base mt-3 font-light">
                Tricity&apos;s most searched neighbourhoods
              </p>
            </div>
            <Link
              href="/properties"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 group px-5 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 hover:border-indigo-500/40 transition-all shrink-0"
            >
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Locality grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
            {LOCALITIES.map((loc) => (
              <Link
                key={loc.name}
                href={`/properties?q=${loc.name}`}
                className="relative overflow-hidden bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-6 lg:p-8 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 group"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-linear-to-br ${loc.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                {/* Tag badge */}
                <div className="relative z-10 flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{loc.tag}</span>
                </div>

                {/* Name */}
                <div className="relative z-10 font-bold text-white text-xl lg:text-2xl mb-2 group-hover:text-indigo-300 transition-colors tracking-tight">
                  {loc.name}
                </div>

                {/* Count + Arrow */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">{loc.count} listings</span>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — CTA Banner
        ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 pb-32 relative z-20">
          <div className="relative rounded-[2.5rem] overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute -inset-px rounded-[2.5rem] bg-linear-to-r from-indigo-500/50 via-purple-500/50 to-indigo-500/50 opacity-30 animate-pulse" />

            {/* Card body */}
            <div className="relative bg-[#0b1120]/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
              {/* Decorative glow orbs */}
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative px-8 py-20 sm:py-24 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest mb-8">
                  <Globe size={14} /> Zero brokerage for owners
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
                  Own a property?{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-purple-300 to-indigo-400">
                    List it for free.
                  </span>
                </h2>
                <p className="text-slate-300 mb-12 max-w-2xl mx-auto text-lg sm:text-xl font-light">
                  Reach thousands of genuine buyers and tenants in Chandigarh, Mohali &amp; Panchkula.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(!session || isSeller) && (
                    <Link
                      href="/dashboard/list-property"
                      className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:scale-105 transition-all duration-300 text-lg"
                    >
                      List your property
                      <ArrowRight size={18} />
                    </Link>
                  )}
                  {!session && (
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md text-white font-bold px-8 py-4 rounded-2xl border border-white/15 hover:bg-white/10 hover:border-white/25 hover:scale-105 transition-all duration-300 text-lg"
                    >
                      Create free account
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}