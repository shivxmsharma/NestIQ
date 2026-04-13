"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Shield, Zap, Star,
  ChevronRight, Bot, Sparkles
} from "lucide-react";

const TABS = ["Buy", "Rent", "PG"];

const LOCALITIES = [
  { name: "Sector 17", tag: "City Centre", count: 124 },
  { name: "Sector 35", tag: "IT Hub", count: 89 },
  { name: "Mohali", tag: "Upcoming", count: 210 },
  { name: "Panchkula", tag: "Premium", count: 156 },
  { name: "Zirakpur", tag: "Affordable", count: 302 },
  { name: "Sector 7", tag: "Residential", count: 78 },
];

const WHY_NESTIQ = [
  {
    icon: Shield,
    title: "Trust Score on Every Listing",
    desc: "AI scans for fraud so you never get cheated.",
  },
  {
    icon: Bot,
    title: "AI Property Assistant",
    desc: "Find the best matches instantly using plain language.",
  },
  {
    icon: Zap,
    title: "Hyper-local Intelligence",
    desc: "Walkability, AQI, and schools inside the listing.",
  },
  {
    icon: Star,
    title: "Transparent Broker Ratings",
    desc: "Real ratings. No ghost brokers, no fake leads.",
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
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* —— Hero Section —— */}
        <section className="relative min-h-[85vh] flex flex-col justify-center text-white overflow-hidden pb-20 pt-32">
          <div className="max-w-4xl mx-auto text-center">

            {/* Micro Badge */}
            <div className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full mb-8 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Now live in Chandigarh, Mohali & Panchkula
            </div>

            {/* Headline */}
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
                  className="text-xs font-bold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2 rounded-full transition-all"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* —— Trust Banner (Why NestIQ) —— */}
        <section className="py-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            {WHY_NESTIQ.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start group">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all shadow-inner">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* —— Popular Localities —— */}
        <section className="py-16 relative z-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white drop-shadow-md">Popular localities</h2>
              <p className="text-slate-400 text-sm font-medium mt-2">Tricity&apos;s most searched neighbourhoods</p>
            </div>
            <Link
              href="/properties"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 group px-5 py-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 transition-all"
            >
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LOCALITIES.map((loc) => (
              <Link
                key={loc.name}
                href={`/properties?q=${loc.name}`}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 hover:bg-white/10 hover:border-indigo-400/50 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{loc.tag}</span>
                </div>
                <div className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition-colors">
                  {loc.name}
                </div>
                <div className="text-xs font-medium text-slate-400">{loc.count} listings</div>
              </Link>
            ))}
          </div>
        </section>

        {/* —— CTA Banner —— */}
        <section className="py-16 pb-32 relative z-20">
          <div className="relative rounded-[3rem] overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-indigo-600/5 mix-blend-overlay" />

            <div className="relative px-8 py-20 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                Own a property? <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">List it for free.</span>
              </h2>
              <p className="text-slate-300 mb-12 max-w-2xl mx-auto text-xl font-light">
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
      </div>
    </div>
  );
}