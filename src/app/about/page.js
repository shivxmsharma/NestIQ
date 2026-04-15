/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { ShieldCheck, MapPin, Building2, Smile, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] relative w-full pt-16 pb-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <nav className="text-sm text-slate-400 mb-10 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">About Us</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-24 mt-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Find smarter, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">live better.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Welcome to NestIQ, Chandigarh's most trusted and technologically advanced real estate platform. We're on a mission to bring complete transparency to property deals.
          </p>
        </div>

        {/* Vision & Mission Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-[50px] group-hover:bg-indigo-500/30 transition-colors duration-500" />
            <Target className="w-12 h-12 text-indigo-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed">
              To eliminate the stress and friction from finding a home. We believe everyone deserves a genuine, verified property listing without the hidden agendas of middlemen. NestIQ builds trust through strict verification processes and AI-powered insights.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 relative overflow-hidden group">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/20 blur-[50px] group-hover:bg-emerald-500/30 transition-colors duration-500" />
            <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-slate-400 leading-relaxed">
              To become the definitive, singular source of truth for the Indian real estate market, starting right here in Chandigarh. We envision a future where property transactions are as simple and transparent as buying a book online.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why choose NestIQ?</h2>
            <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">100% Verified</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Every listing is cross-checked with rigorous trust scores and RERA regulations to guarantee authenticity.</p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10">
                <Smile className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Zero Brokerage</h3>
              <p className="text-slate-400 text-sm leading-relaxed">We connect buyers and owners directly, cutting out hefty commissions and making homes affordable.</p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                <MapPin className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Chandigarh Focus</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Built block by block, sector by sector. We know the Tri-city area better than anyone else.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-linear-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/20 rounded-3xl p-12 text-center backdrop-blur-md">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start your journey?</h2>
          <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
            Whether you're looking to buy your first home, rent an apartment, or list a property you own, NestIQ is here for you.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/properties" className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">
              Browse Properties
            </Link>
            <Link href="/contact" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/10">
              Contact Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}