"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, Plus, Eye, Users, 
  Settings, Trash2, LayoutGrid, ArrowUpRight,
  Search, Filter, MoreHorizontal, MessageSquare,
  BadgeCheck, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/manage/builder/projects");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProjects(data.projects || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/manage/builder/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Project deleted successfully");
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.city.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLORS = {
    "Upcoming": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "Under Construction": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Ready to Move": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Completed": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Loading your project portfolio...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <LayoutGrid className="text-amber-500" />
            Project Inventory
          </h1>
          <p className="text-slate-400 mt-1">Manage your developments, track views, and engage with buyers.</p>
        </div>
        <Link href="/manage/builder/projects/new" className="flex items-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 rounded-2xl text-white font-black transition-all shadow-xl shadow-amber-500/20 uppercase tracking-widest text-sm">
          <Plus className="w-5 h-5" /> Launch New Project
        </Link>
      </div>

      {/* Search & Bulk Actions Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-transparent border-none focus:ring-0 text-white text-sm pl-11 pr-4 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-white/10" />
        <div className="flex items-center gap-2 px-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
          <select className="bg-transparent border-none text-white text-xs font-bold focus:ring-0">
            <option className="bg-[#0b1120]">All Projects</option>
            <option className="bg-[#0b1120]">Active Only</option>
            <option className="bg-[#0b1120]">Drafts</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid gap-6">
        {filtered.length === 0 ? (
          <div className="py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
            <Building2 className="mx-auto w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Matching Projects</p>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p._id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-8 p-8">
                {/* Visual */}
                <div className="w-full md:w-64 h-44 rounded-3xl relative overflow-hidden bg-white/5 shrink-0 border border-white/10">
                  {p.coverImage ? (
                    <Image src={p.coverImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="text-slate-700" size={32} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{p.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {p.location?.city}</span>
                      <span className="flex items-center gap-1.5"><LayoutGrid size={14} /> {p.projectType}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 mt-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-indigo-400">{p.views || 0}</span>
                      <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Global Views</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-emerald-400">{p.interestCount || 0}</span>
                      <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Buyer Leads</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-white">
                        {p.priceRange?.min ? `₹${(p.priceRange.min / 100000).toFixed(0)}L+` : "TBD"}
                      </span>
                      <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Starting Price</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 justify-center shrink-0">
                  <Link 
                    href={`/manage/builder/projects/${p._id}/leads`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-all"
                  >
                    <MessageSquare size={14} /> View Leads
                  </Link>
                  <Link 
                    href={`/manage/builder/projects/${p._id}/edit`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white font-bold text-xs transition-all"
                  >
                    <Settings size={14} /> Edit Project
                  </Link>
                  <div className="flex gap-2">
                    <Link 
                      href={`/builders/projects/${p.slug}`}
                      target="_blank"
                      className="flex-1 flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                      title="Preview"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(p._id, p.title)}
                      className="flex-1 flex items-center justify-center p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Timeline Indicator Footer */}
              <div className="bg-white/5 border-t border-white/5 px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-1.5">
                    {p.reraNumber ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-amber-500" />}
                    <span className="text-[10px] font-bold text-slate-500 uppercase">RERA: {p.reraNumber || "INCOMPLETE"}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Last Updated: {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}</span>
                   </div>
                </div>
                <Link href={`/manage/builder/projects/${p._id}/updates`} className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-400 transition-colors">
                  Post Construction Update +
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
