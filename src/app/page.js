"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Shield, Zap, Star, TrendingUp,
  Home, Building2, Warehouse, Users, ChevronRight,
  CheckCircle, Bot, Sparkles
} from "lucide-react";

const TABS = ["Buy", "Rent", "PG"];

const LOCALITIES = [
  { name: "Sector 17", tag: "City Centre", count: 124, color: "bg-indigo-50" },
  { name: "Sector 35", tag: "IT Hub", count: 89, color: "bg-purple-50" },
  { name: "Mohali", tag: "Upcoming", count: 210, color: "bg-green-50" },
  { name: "Panchkula", tag: "Premium", count: 156, color: "bg-orange-50" },
  { name: "Zirakpur", tag: "Affordable", count: 302, color: "bg-pink-50" },
  { name: "Sector 7", tag: "Residential", count: 78, color: "bg-yellow-50" },
];

const PROPERTY_TYPES = [
  { label: "Apartment", icon: Building2, href: "/properties?type=apartment" },
  { label: "House / Villa", icon: Home, href: "/properties?type=house" },
  { label: "Plot", icon: Warehouse, href: "/properties?type=plot" },
  { label: "PG / Hostel", icon: Users, href: "/properties?listing=pg" },
];

const STATS = [
  { value: "10,000+", label: "Listed Properties" },
  { value: "2,500+", label: "Happy Families" },
  { value: "500+", label: "Verified Brokers" },
  { value: "4.8★", label: "Average Rating" },
];

const WHY_NESTIQ = [
  {
    icon: Shield,
    title: "Trust Score on Every Listing",
    desc: "Our AI scans each listing for fraud signals and assigns a Trust Score — so you never get cheated.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: Bot,
    title: "AI Property Assistant",
    desc: "Just describe what you need in plain language. Our AI finds the best matches instantly.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Zap,
    title: "Hyper-local Intelligence",
    desc: "Walkability score, nearest metro, air quality index, schools — all inside the listing.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Star,
    title: "Transparent Broker Ratings",
    desc: "Real ratings, real response times. No ghost brokers, no fake leads.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Buy");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing", activeTab.toLowerCase());
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative">
      <div className="relative z-10">
        <section className="relative min-h-[85vh] flex flex-col justify-center text-white overflow-hidden pb-20 pt-32">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">

              <div className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Now live in Chandigarh, Mohali & Panchkula
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight drop-shadow-2xl">
                Find your perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-500 mt-2 pb-2">
                  home in the tricity.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light drop-shadow-md">
                AI-powered search. Fraud-proof listings. Verified brokers. The smarter way to find your future home.
              </p>

              {/* Glassmorphic Omnisearch */}
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-3xl mx-auto">
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
                    className="text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 px-5 py-2 rounded-full transition-all"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 -mt-8 mb-20 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl hover:bg-white/10 transition-colors">
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Property Types ── */}
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 mb-20 relative z-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Browse by type</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PROPERTY_TYPES.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-indigo-400/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-indigo-500/20 flex items-center justify-center transition-all duration-300">
                  <Icon className="w-7 h-7 text-indigo-400" />
                </div>
                <span className="text-base font-semibold text-slate-300 group-hover:text-white transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Popular Localities ── */}
        <section className="py-20 mb-0 relative z-20">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md border-y border-white/10" />
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-md">Popular localities</h2>
                <p className="text-slate-400 text-base mt-2">Tricity&apos;s most searched neighbourhoods</p>
              </div>
              <Link
                href="/properties"
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 group"
              >
                View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {LOCALITIES.map((loc) => (
                <Link
                  key={loc.name}
                  href={`/properties?q=${loc.name}`}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-5 hover:bg-white/10 hover:border-indigo-400/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{loc.tag}</span>
                  </div>
                  <div className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors">
                    {loc.name}
                  </div>
                  <div className="text-sm font-medium text-slate-400">{loc.count} listings</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why NestIQ ── */}
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-24 relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white drop-shadow-md">Why NestIQ?</h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg font-light">
              We built the features others don&apos;t have — and fixed the ones they got wrong.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_NESTIQ.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40 transition-all duration-300">
                  <Icon className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />
                </div>
                <h3 className="font-bold text-white mb-3 text-xl">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-32 relative z-20">
          <div className="relative rounded-[3rem] overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600/30 backdrop-blur-3xl border border-white/20" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-indigo-600/20 mix-blend-overlay" />

            <div className="relative px-8 py-20 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                Own a property? <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">List it for free.</span>
              </h2>
              <p className="text-indigo-200 mb-12 max-w-2xl mx-auto text-xl font-light">
                Reach thousands of genuine buyers and tenants in Chandigarh. Zero brokerage for owners.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  href="/dashboard/list-property"
                  className="bg-white text-indigo-900 font-bold px-8 py-4 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300 text-lg"
                >
                  List your property
                </Link>
                {!session && (
                  <Link
                    href="/auth/register"
                    className="bg-white/10 backdrop-blur-md text-white font-bold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-lg shadow-xl"
                  >
                    Create free account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-12 pb-32 relative z-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 lg:p-20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-16 drop-shadow-md">How NestIQ works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: "01", title: "Search or ask AI", desc: "Use our search or just chat with our AI assistant — describe your ideal home in plain language." },
                { step: "02", title: "Compare & verify", desc: "Every listing has a Trust Score, locality intelligence, and verified broker ratings." },
                { step: "03", title: "Schedule & close", desc: "Book a site visit, chat directly with the owner, and close the deal — all inside NestIQ." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col gap-6 text-center lg:text-left lg:flex-row lg:items-start group">
                  <div className="text-6xl font-black text-indigo-400/20 shrink-0 leading-none group-hover:text-indigo-400 transition-colors duration-500 mx-auto lg:mx-0">{step}</div>
                  <div>
                    <h3 className="font-bold text-white mb-3 text-xl">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-light">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}