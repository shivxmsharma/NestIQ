"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Shield, Zap, Star, TrendingUp,
  Home, Building2, Warehouse, Users, ChevronRight,
  CheckCircle, Bot
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
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)", backgroundSize: "100px 100px" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <MapPin className="w-3.5 h-3.5" />
              Now live in Chandigarh, Mohali & Panchkula
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Find your perfect
              <span className="block text-yellow-300">home in Chandigarh</span>
            </h1>

            <p className="text-lg text-indigo-100 mb-10 max-w-xl">
              AI-powered search. Fraud-proof listings. Verified brokers. The smarter way to find property in the tricity.
            </p>

            {/* Search box */}
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              {/* Tabs */}
              <div className="flex gap-1 mb-2 px-1 pt-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSearch} className="flex gap-2 p-1">
                <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by locality, sector, or landmark..."
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shrink-0"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["Sector 17", "Mohali", "Zirakpur", "Panchkula", "Sector 35"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSearchQuery(loc)}
                  className="text-xs text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1200 40 960 60 720 60C480 60 240 40 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Property Types ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Browse by type</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROPERTY_TYPES.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-center justify-center gap-3 bg-white border border-slate-100 rounded-2xl p-8 hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Popular Localities ── */}
      <section className="bg-slate-50 py-20 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular localities</h2>
              <p className="text-slate-500 text-sm mt-1">Tricity&apos;s most searched neighbourhoods</p>
            </div>
            <Link
              href="/properties"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {LOCALITIES.map((loc) => (
              <Link
                key={loc.name}
                href={`/properties?q=${loc.name}`}
                className={`${loc.color} rounded-2xl p-5 hover:shadow-md transition-all group`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{loc.tag}</span>
                </div>
                <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                  {loc.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">{loc.count} listings</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why NestIQ ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Why NestIQ?</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">
            We built the features Housing.com doesn&apos;t have — and fixed the ones they got wrong.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_NESTIQ.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-600 py-16 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Own a property? List it for free.
          </h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Reach thousands of genuine buyers and tenants in Chandigarh. Zero brokerage for owners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/list-property"
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              List your property
            </Link>
            {!session && (
              <Link
                href="/auth/register"
                className="bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400"
              >
                Create free account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">How NestIQ works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Search or ask AI", desc: "Use our search or just chat with our AI assistant — describe your ideal home in plain language." },
            { step: "02", title: "Compare & verify", desc: "Every listing has a Trust Score, locality intelligence, and verified broker ratings." },
            { step: "03", title: "Schedule & close", desc: "Book a site visit, chat directly with the owner, and close the deal — all inside NestIQ." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-5">
              <div className="text-4xl font-black text-indigo-100 shrink-0 leading-none">{step}</div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}