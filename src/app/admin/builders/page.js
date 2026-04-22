"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, BadgeCheck, ShieldAlert, 
  Trash2, Search, Filter, ArrowRight,
  TrendingUp, Star, MoreVertical, X,
  CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminBuildersPage() {
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBuilders = async () => {
    try {
      const res = await fetch("/api/admin/builders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBuilders(data.builders || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuilders(); }, []);

  const toggleStatus = async (builderId, field, currentValue) => {
    try {
      const res = await fetch("/api/admin/builders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ builderId, [field]: !currentValue })
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`${field} updated`);
      setBuilders(builders.map(b => b._id === builderId ? { ...b, [field]: !currentValue } : b));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = builders.filter(b => 
    b.companyName.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 font-black text-xs uppercase">Opening Governance Console...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-amber-500" />
            Builder Moderation
          </h1>
          <p className="text-slate-400 mt-1">Review developer credentials, verify accounts, and manage featured partners.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-2xl font-black text-amber-500">{builders.filter(b => !b.isVerified).length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Pending</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-2xl font-black text-emerald-400">{builders.filter(b => b.isVerified).length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Verified</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by company or email..." 
            className="w-full bg-transparent border-none focus:ring-0 text-white text-sm pl-11 pr-4 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all">
          <Filter size={14} /> Filter Status
        </button>
      </div>

      {/* Builder Cards */}
      <div className="grid gap-6">
        {filtered.length === 0 ? (
          <div className="py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
            <Building2 className="mx-auto w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Builders Found</p>
          </div>
        ) : (
          filtered.map((b) => (
            <div key={b._id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all p-8">
              <div className="flex flex-col md:grid md:grid-cols-12 gap-8 items-center">
                
                {/* Logo & Basic Info */}
                <div className="md:col-span-4 flex items-center gap-6 w-full">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {b.logo ? <img src={b.logo} className="w-full h-full object-cover" /> : <Building2 className="text-slate-700" size={32} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white flex items-center gap-2 truncate">
                      {b.companyName}
                      {b.isVerified && <BadgeCheck className="text-emerald-400 w-5 h-5 shrink-0" />}
                    </h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">{b.headquarters?.city || "Punjab"}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1 truncate">{b.user?.email}</p>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="md:col-span-3 flex justify-around w-full border-x border-white/5 px-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">{b.totalProjects || 0}</div>
                    <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-amber-500">{b.rating || "N/A"}</div>
                    <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Rating</div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="md:col-span-2 flex flex-col gap-2 w-full">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${b.isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {b.isVerified ? 'Verified Account' : 'Verification Needed'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Clock size={10} /> Joined {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="md:col-span-3 flex flex-wrap gap-2 justify-end w-full">
                  <button 
                    onClick={() => toggleStatus(b._id, 'isVerified', b.isVerified)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${
                      b.isVerified 
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    {b.isVerified ? 'Revoke Verified' : 'Confirm Verify'}
                  </button>
                  <button 
                    onClick={() => toggleStatus(b._id, 'isFeatured', b.isFeatured)}
                    className={`p-3 rounded-xl border transition-all ${
                      b.isFeatured 
                      ? 'bg-amber-500 text-white border-amber-500' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 shadow-xl'
                    }`}
                    title="Feature Builder"
                  >
                    <TrendingUp size={16} />
                  </button>
                  <Link 
                    href={`/builders/${b.slug}`}
                    target="_blank"
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-xl"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* RERA Info Footer */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className={b.reraId ? "text-emerald-500" : "text-slate-700"} /> RERA: {b.reraId || "UNSPECIFIED"}</span>
                <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-500" /> Platinum Partner: {b.isFeatured ? "YES" : "NO"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
