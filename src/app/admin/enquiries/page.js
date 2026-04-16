"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  RefreshCw,
  Clock,
  ArrowRight,
  ChevronDown
} from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Enquiries", color: "text-slate-300", badgeColor: "text-slate-400" },
    { value: "pending", label: "Pending", color: "text-amber-400", badgeColor: "bg-amber-400" },
    { value: "responded", label: "Responded", color: "text-emerald-400", badgeColor: "bg-emerald-400" },
    { value: "closed", label: "Closed", color: "text-indigo-400", badgeColor: "bg-indigo-400" },
    { value: "spam", label: "Spam / Blacklist", color: "text-red-400", badgeColor: "bg-red-400" },
  ];

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch enquiries");
      setEnquiries(data.enquiries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      );

      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update enquiry status");
    } catch (err) {
      alert(err.message);
      fetchEnquiries();
    }
  };

  const getStatusBadge = (status) => {
    let style = "";
    switch (status) {
      case "responded": style = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"; break;
      case "pending": style = "bg-amber-500/20 text-amber-400 border border-amber-500/30"; break;
      case "closed": style = "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"; break;
      case "spam": style = "bg-red-500/20 text-red-400 border border-red-500/30"; break;
      default: style = "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
        {status}
      </span>
    );
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const s = searchQuery.toLowerCase();
    const searchMatch =
      e.property?.title?.toLowerCase().includes(s) ||
      e.buyer?.name?.toLowerCase().includes(s) ||
      e.owner?.name?.toLowerCase().includes(s) ||
      e.message?.toLowerCase().includes(s);

    const statusMatch = statusFilter === "all" || e.status === statusFilter;

    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            Platform Enquiries
          </h1>
          <p className="text-sm text-slate-400 mt-1">Audit communications, track lead conversions, and mitigate spam.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-48 pl-9 pr-4 py-2 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white focus:outline-none hover:bg-white/5 transition-all shadow-xl"
            >
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <span className="truncate pr-2">{statusOptions.find(o => o.value === statusFilter)?.label}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute right-0 lg:left-0 top-full mt-2 w-56 bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] py-2 z-50 transform origin-top-right lg:origin-top-left transition-all">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors ${statusFilter === opt.value ? 'bg-white/5' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.value === 'all' ? 'bg-slate-400' : opt.badgeColor.split(' ')[0]}`} />
                      <span className={opt.color}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Fetching communication logs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-red-500/5">
            {error}. Unauthorized.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Time & Lead</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Connection</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Context</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No communications match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Meta */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                          <Clock className="w-3.5 h-3.5" />
                          {enq.createdAt ? format(new Date(enq.createdAt), "MMM dd, yyyy") : "Archive"}
                        </div>
                        <div className="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white font-medium">
                          {enq.enquiryType === 'visit' ? 'Site Visit' : enq.enquiryType === 'offer' ? 'Make an Offer' : 'General Query'}
                        </div>
                      </td>

                      {/* Connection Line */}
                      <td className="px-6 py-4 space-y-2">
                        {/* Buyer */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {enq.buyer?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="text-xs text-slate-300 w-32 truncate">{enq.buyer?.name}</div>
                        </div>

                        <div className="pl-2">
                          <ArrowRight className="w-4 h-4 text-slate-600" />
                        </div>

                        {/* Owner / Agent */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {enq.owner?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="text-xs text-purple-300 w-32 truncate">{enq.owner?.name} (Owner)</div>
                        </div>
                      </td>

                      {/* Message / Context */}
                      <td className="px-6 py-4 max-w-[250px]">
                        {enq.property ? (
                          <Link href={`/properties/${enq.property._id}`} target="_blank" className="font-bold text-sm text-indigo-300 hover:text-indigo-400 underline truncate block">
                            {enq.property.title}
                          </Link>
                        ) : (
                          <span className="font-bold text-sm text-red-400 block mb-1">[Deleted Property]</span>
                        )}
                        <p className="text-xs text-slate-400 mt-1 truncate" title={enq.message}>
                          "{enq.message || "No message provided"}"
                        </p>
                      </td>

                      {/* Status Check */}
                      <td className="px-6 py-4">
                        {getStatusBadge(enq.status || "pending")}
                        {!enq.isRead && enq.status !== 'closed' && (
                          <div className="text-[10px] text-red-400 font-bold mt-1 tracking-wider uppercase">Unread by Owner</div>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Spam Control */}
                          {enq.status !== 'spam' && (
                            <button onClick={() => handleStatusChange(enq._id, "spam")} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors group" title="Mark as Spam">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {/* Mark Closed */}
                          {enq.status !== 'closed' && (
                            <button onClick={() => handleStatusChange(enq._id, "closed")} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors group" title="Force Close Ticket">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {enq.status === 'spam' && (
                            <button onClick={() => handleStatusChange(enq._id, "pending")} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors group" title="Unmark Spam">
                              <CheckCircle className="w-4 h-4" /> Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}