/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Maximize2, Building, BedDouble, Hammer, TrendingUp, AlertCircle, IndianRupee, Activity, Target } from "lucide-react";

export default function ValuationPage() {
  const [form, setForm] = useState({
    location: "Sector 15, Chandigarh",
    size: 2000,
    propertyType: "Independent House",
    bedrooms: 3,
    condition: "Well Maintained",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to get valuation.");
      }
    } catch (err) {
      setError("Network error. Please make sure you are connected to the internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] relative w-full pt-12 pb-24 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-slate-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Property Valuation</span>
        </nav>

        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI-Powered
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Valuation Engine
          </h1>
          <p className="text-slate-400 max-w-2xl text-base md:text-lg">
            Instantly estimate your property's market value based on real-time trends, locality pricing, and automated AI analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Input Form (Left) */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 self-start">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              Property Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" /> Locality / Sector
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full bg-[#0b1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Sector 15, Chandigarh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-emerald-400" /> Size (sq.ft)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: Number(e.target.value) })}
                    className="w-full bg-[#0b1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 items-center gap-2">
                    <BedDouble className="w-4 h-4 text-rose-400" /> Bedrooms
                  </label>
                  <select
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                    className="w-full bg-[#0b1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num} className="bg-[#0b1120] text-white">
                        {num} {num === 6 ? "+" : ""} BHK
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400" /> Property Type
                </label>
                <select
                  value={form.propertyType}
                  onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  className="w-full bg-[#0b1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="Independent House" className="bg-[#0b1120]">Independent House</option>
                  <option value="Apartment/Flat" className="bg-[#0b1120]">Apartment / Flat</option>
                  <option value="Empty Plot" className="bg-[#0b1120]">Empty Plot / Land</option>
                  <option value="Commercial Space" className="bg-[#0b1120]">Commercial Space</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 items-center gap-2">
                  <Hammer className="w-4 h-4 text-amber-400" /> Condition & Age
                </label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full bg-[#0b1120]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="Newly Built / Pre-construction" className="bg-[#0b1120]">Newly Built / Ready to move</option>
                  <option value="Well Maintained (1-5 years)" className="bg-[#0b1120]">Well Maintained (1-5 years)</option>
                  <option value="Older (5-15 years)" className="bg-[#0b1120]">Older (5-15 years)</option>
                  <option value="Needs Renovation" className="bg-[#0b1120]">Needs Renovation</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !form.location}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-300" /> Analyzing Market...
                  </>
                ) : (
                  "Calculate Valuation"
                )}
              </button>

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm mt-4 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Results Display (Right) */}
          <div className="lg:col-span-7 flex flex-col h-full gap-6">
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl border-dashed">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Awaiting Parameters</h3>
                <p className="text-slate-400 max-w-sm">
                  Enter your property details on the left, and our AI will crunch surrounding market data to give you an instant valuation estimate.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-amber-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Our AI is computing...</h3>
                <p className="text-slate-400 text-sm max-w-xs animate-pulse">
                  Aggregating recent sales, adjusting for condition, and compiling current market trends for {form.location}.
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 ease-out h-full flex flex-col">

                {/* Main Price Tag */}
                <div className="bg-linear-to-br from-indigo-900/40 to-[#0b1120] border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                  <p className="text-sm font-medium text-indigo-300 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4" /> Estimated Value Range
                  </p>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md mb-4 mt-2">
                    {result.estimatedRange}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${result.confidence === "High" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" :
                        result.confidence === "Medium" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
                          "bg-rose-500/20 border-rose-500/30 text-rose-400"
                      }`}>
                      {result.confidence} Confidence Score
                    </span>
                    <span className="text-xs text-slate-400">
                      Based on AI analysis of recent trends
                    </span>
                  </div>
                </div>

                {/* Sub Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-slate-300 font-medium">Avg Rate / Sq.Ft</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{result.averageRatePerSqFt}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-rose-400" />
                      </div>
                      <h3 className="text-slate-300 font-medium">Est. Rental Yield</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{result.rentalYieldEstimate}</p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:col-span-2">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-slate-200 font-semibold mb-1">Market Trend Summary</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {result.marketTrendSummary}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="text-center mt-2">
                  <p className="text-xs text-slate-500 max-w-xl mx-auto">
                    <strong>Disclaimer:</strong> This valuation is an AI-generated estimate intended for informational purposes only. It does not replace a professional appraisal or official market guarantee.
                  </p>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}