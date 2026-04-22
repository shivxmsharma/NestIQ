"use client";
import { useState, useEffect } from "react";
import { 
  Users, MessageSquare, Phone, Mail, 
  IndianRupee, Calendar, Search, Filter,
  ArrowRight, CheckCircle2, XCircle, Clock,
  MoreVertical, Building2, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProjectLeadsPage({ params }) {
  const [leads, setLeads] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const { id } = await params;
      const [leadsRes, projectsRes] = await Promise.all([
        fetch(`/api/manage/builder/projects/${id}/leads`),
        fetch(`/api/manage/builder/projects`)
      ]);
      
      const leadsData = await leadsRes.json();
      const projectsData = await projectsRes.json();
      
      if (!leadsRes.ok) throw new Error(leadsData.error);
      
      setLeads(leadsData.interests || []);
      const currentProj = projectsData.projects?.find(p => p._id === id);
      setProject(currentProj);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/manage/builder/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Lead marked as ${newStatus}`);
      setLeads(leads.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const STATUS_CONFIG = {
    "New": { color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: Clock },
    "Contacted": { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Phone },
    "Converted": { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    "Lost": { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle },
  };

  const filtered = leads.filter(l => 
    l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 uppercase font-black text-xs">Opening Lead Portal...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <Link href="/manage/builder/projects" className="flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors text-xs font-black uppercase tracking-widest">
          <ChevronLeft size={14} /> Back to Projects
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="text-amber-500" />
              Buyer Leads
            </h1>
            <p className="text-slate-400 mt-1">Managing {leads.length} interests for <span className="text-white font-bold">{project?.title || "Project"}</span></p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-2xl font-black text-emerald-400">{leads.filter(l => l.status === "Converted").length}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Converted</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-2xl font-black text-indigo-400">{leads.filter(l => l.status === "New").length}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">New</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500 ml-2" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="flex-grow bg-transparent border-none focus:ring-0 text-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-32 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
            <Users className="mx-auto w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Leads Found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((lead) => {
              const SStatus = STATUS_CONFIG[lead.status] || STATUS_CONFIG["New"];
              const StatusIcon = SStatus.icon;
              
              return (
                <div key={lead._id} className="group bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/[0.08] transition-all">
                  <div className="grid md:grid-cols-4 items-center gap-6">
                    
                    {/* User Info */}
                    <div className="md:col-span-1 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-black text-xl shrink-0">
                        {lead.user?.name?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{lead.user?.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Calendar size={12} /> {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Mail size={14} className="text-slate-500" /> {lead.user?.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Phone size={14} className="text-slate-500" /> {lead.user?.phone || "No Phone"}
                      </div>
                    </div>

                    {/* Interest Details */}
                    <div className="md:col-span-1 border-l border-white/5 pl-6">
                      <div className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1">Interest</div>
                      <div className="text-sm text-white font-bold">{lead.interestedConfig || "General Interest"}</div>
                      <div className="text-emerald-400 font-black flex items-center gap-1 mt-1">
                        <IndianRupee size={12} /> {(lead.budget / 100000).toFixed(0)}L Budget
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${SStatus.color}`}>
                        <StatusIcon size={14} />
                        {lead.status}
                      </div>
                      
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead._id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                      >
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s} className="bg-[#0b1120]">{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {lead.message && (
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-slate-400 italic flex gap-3">
                      <MessageSquare size={16} className="shrink-0 text-slate-600" />
                      "{lead.message}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
