"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Plus, Users, Eye, 
  TrendingUp, Settings, ArrowRight,
  BadgeCheck, LayoutGrid, Clock, ChevronRight
} from "lucide-react";

export default function BuilderDashboardClient() {
  const [data, setData] = useState({ builder: null, projects: [], loading: true });

  useEffect(() => {
    Promise.all([
      fetch("/api/manage/builder/profile").then((r) => r.json()),
      fetch("/api/manage/builder/projects").then((r) => r.json()),
    ]).then(([profileData, projectsData]) => {
      setData({ 
        builder: profileData.builder, 
        projects: projectsData.projects || [], 
        loading: false 
      });
    }).catch(err => {
      console.error("Dashboard fetch error:", err);
      setData(prev => ({ ...prev, loading: false }));
    });
  }, []);

  const totalViews = data.projects?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
  const totalInterests = data.projects?.reduce((sum, p) => sum + (p.interestCount || 0), 0) || 0;

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Assembling Your Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header & Verification Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {data.builder?.companyName || "Builder Console"}
              </h1>
              {data.builder?.isVerified && <BadgeCheck className="text-emerald-400 w-6 h-6" />}
            </div>
            <p className="text-slate-400 font-medium">
              Overseeing {data.projects.length} development{data.projects.length !== 1 ? 's' : ''} in NestIQ ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/manage/builder/profile" className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-xl">
              <Settings className="w-4 h-4" /> Profile Settings
            </Link>
            <Link href="/manage/builder/projects/new" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-2xl text-sm text-white font-black transition-all shadow-xl shadow-amber-500/20 uppercase tracking-widest">
              <Plus className="w-4 h-4" /> New Launch
            </Link>
          </div>
        </div>

        {!data.builder?.isVerified && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 text-sm text-amber-500 flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Clock size={80} />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-xs mb-1">Status: Pending Verification</p>
              <p className="text-slate-400">Your profile is being reviewed by our admin team. Projects will be visible in the directory once verified.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: data.projects?.length, icon: Building2, color: "text-amber-400", bg: "from-amber-500/10" },
          { label: "Project Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-indigo-400", bg: "from-indigo-500/10" },
          { label: "Qualified Leads", value: totalInterests, icon: Users, color: "text-emerald-400", bg: "from-emerald-500/10" },
          { label: "Market Status", value: data.builder?.isFeatured ? "Featured" : "Active", icon: TrendingUp, color: "text-rose-400", bg: "from-rose-500/10" },
        ].map((s) => (
          <div key={s.label} className={`bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <div className="text-3xl font-black text-white">{s.value ?? "0"}</div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Project Management Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LayoutGrid size={18} className="text-amber-500" />
              Latest Developments
            </h2>
            <Link href="/manage/builder/projects" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            {data.projects?.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <Building2 className="w-12 h-12 mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Projects Registered</p>
                <Link href="/manage/builder/projects/new" className="inline-block px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-all">
                  Launch Your First Project
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.projects.slice(0, 5).map((p) => (
                  <div key={p._id} className="group flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        {p.coverImage ? <Image src={p.coverImage} alt={p.title} width={48} height={48} className="object-cover h-full" /> : <Building2 className="w-5 h-5 m-3.5 text-slate-700" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">{p.title}</div>
                        <div className="text-xs text-slate-500 font-bold mt-0.5">{p.status} · {p.location?.city}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-white font-bold text-sm">{p.interestCount}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-black">Leads</span>
                      </div>
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-white font-bold text-sm">{p.views}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-black">Views</span>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={`/manage/builder/projects/${p._id}/edit`} 
                          className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all"
                        >
                          <Settings size={16} />
                        </Link>
                        <Link 
                          href={`/builders/projects/${p.slug}`} 
                          target="_blank"
                          className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/10"
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Builder Profile Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white px-2">Brand Profile</h2>
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-2xl">
                  {data.builder?.logo ? <Image src={data.builder.logo} alt="Logo" width={96} height={96} className="object-cover" /> : <Building2 size={40} className="text-slate-700" />}
                </div>
                <h3 className="text-lg font-black text-white">{data.builder?.companyName}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">NESTIQ PARTNER</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Established</span>
                  <span className="text-white font-bold">{data.builder?.establishedYear || "TBD"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">RERA ID</span>
                  <span className="text-white font-mono font-bold tracking-tighter">{data.builder?.reraId || "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">City</span>
                  <span className="text-white font-bold">{data.builder?.headquarters?.city || "—"}</span>
                </div>
              </div>

              <Link href="/manage/builder/profile" className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-slate-300 hover:text-white transition-all group">
                Edit Company Info <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
