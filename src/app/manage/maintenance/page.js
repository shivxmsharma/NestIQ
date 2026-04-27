"use client";

import { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle, MessageSquare, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Maintenance() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "plumbing",
    priority: "medium",
    leaseId: "", // typically auto-populated if tenant has 1 active lease, keeping empty for dynamic lookup if you want
  });

  const isLandlord = ["seller", "broker", "admin"].includes(session?.user?.role);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/manage/maintenance");
      if (!res.ok) throw new Error("Failed to load tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/manage/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create ticket");

      setTickets([data.ticket, ...tickets]);
      setShowModal(false);
      setFormData({ title: "", description: "", category: "plumbing", priority: "medium", leaseId: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`/api/manage/maintenance/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const { ticket: updated } = await res.json();
        setTickets(tickets.map(t => (t._id === ticketId ? updated : t)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "in-progress": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "resolved":
      case "closed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "high": return "bg-red-500/10 text-red-500";
      case "emergency": return "bg-rose-600/20 text-rose-500 font-bold border border-rose-500/30";
      case "medium": return "bg-amber-500/10 text-amber-500";
      case "low": return "bg-blue-500/10 text-blue-500";
      default: return "bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Maintenance Tickets</h1>
          <p className="text-slate-400 mt-1">Manage repair requests and maintenance history.</p>
        </div>

        {!isLandlord && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30"
          >
            <Plus className="w-5 h-5" />
            File Ticket
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Open Tickets", value: tickets.filter(t => t.status === "open").length, icon: AlertTriangle, color: "text-rose-400" },
          { label: "In Progress", value: tickets.filter(t => t.status === "in-progress").length, icon: Clock, color: "text-amber-400" },
          { label: "Resolved", value: tickets.filter(t => ["resolved", "closed"].includes(t.status)).length, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Total Requests", value: tickets.length, icon: Wrench, color: "text-indigo-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0b1120] border border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets List */}
      <div className="bg-[#0b1120] rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Recent Requests</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Maintenance Issues</h3>
            <p className="text-slate-400">There are no open repair requests at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-5 hover:bg-white/5 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} priority
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3 max-w-2xl leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <Wrench className="w-3.5 h-3.5" />
                        <span className="capitalize">{ticket.issueType || ticket.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 focus:outline-none">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Reported by {ticket.reportedBy?.name || "Tenant"}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Landlord */}
                  {isLandlord && ticket.status !== "resolved" && (
                    <div className="flex flex-wrap gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity mt-4 md:mt-0">
                      {ticket.status === "open" && (
                        <button onClick={() => handleUpdateStatus(ticket._id, "in-progress")} className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-sm font-semibold rounded-xl transition-colors">
                          Mark In Progress
                        </button>
                      )}
                      {(ticket.status === "open" || ticket.status === "in-progress") && (
                        <button onClick={() => handleUpdateStatus(ticket._id, "resolved")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 text-sm font-semibold rounded-xl transition-all">
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Modal for New Ticket */}
      {showModal && !isLandlord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">File Maintenance Request</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl border border-rose-500/20 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Broken AC in Bedroom"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please describe what happened..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural/Walls</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
