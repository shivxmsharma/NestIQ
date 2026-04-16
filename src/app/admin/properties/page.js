"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Star,
  ChevronDown
} from "lucide-react";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'pending-review', 'inactive'
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Statuses", color: "text-slate-300", badgeColor: "text-slate-400" },
    { value: "active", label: "Active (Approved)", color: "text-emerald-400", badgeColor: "bg-emerald-500/20 text-emerald-400" },
    { value: "pending-review", label: "Pending Review", color: "text-amber-400", badgeColor: "bg-amber-500/20 text-amber-400" },
    { value: "inactive", label: "Inactive (Suspended)", color: "text-red-400", badgeColor: "bg-red-500/20 text-red-400" },
  ];

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/properties");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch properties");
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      // Optimistic update
      setProperties((prev) =>
        prev.map((p) => (p._id === propertyId ? { ...p, status: newStatus } : p))
      );

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property status");
    } catch (err) {
      alert(err.message);
      // Revert if failed
      fetchProperties();
    }
  };

  const handleFeatureToggle = async (propertyId, currentFeatured) => {
    try {
      // Optimistic update
      setProperties((prev) =>
        prev.map((p) => (p._id === propertyId ? { ...p, isFeatured: !currentFeatured } : p))
      );

      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to feature property");
    } catch (err) {
      alert(err.message);
      fetchProperties();
    }
  };

  const getStatusBadge = (status) => {
    let style = "";
    switch (status) {
      case "active":
        style = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        break;
      case "pending-review":
        style = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
        break;
      case "inactive":
        style = "bg-red-500/20 text-red-400 border border-red-500/30";
        break;
      default:
        style = "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
        {status}
      </span>
    );
  };

  // Filter properties logic
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Property Moderation
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review new listings, suspend rule-breakers, and feature VIP properties.</p>
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] py-2 z-50 transform origin-top-right transition-all">
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

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search properties or agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Loading property database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-red-500/5">
            {error}. Please check your permissions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Listing Info</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Owner/Agent</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Price & Tags</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No properties found matching your search limit criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property) => (
                    <tr key={property._id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Property Primary Info */}
                      <td className="px-6 py-4 max-w-[300px]">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/10">
                            {property.photos?.[0]?.url ? (
                              <Image
                                src={property.photos[0].url}
                                alt={property.title}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <h3 className="font-bold text-white text-sm truncate max-w-[200px]" title={property.title}>
                              {property.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {property.address?.locality || "Unknown Locality"}, {property.address?.city}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                              Listed {format(new Date(property.createdAt || Date.now()), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owner Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {property.owner?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{property.owner?.name || "Unknown"}</div>
                            <div className="text-xs text-slate-400">{property.owner?.email || "No email"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Pricing and Features */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-indigo-300">
                          ₹{property.price?.toLocaleString('en-IN')}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleFeatureToggle(property._id, property.isFeatured)}
                            className={`p-1.5 rounded-md border text-xs transition duration-300 flex items-center gap-1 ${property.isFeatured
                              ? "bg-amber-500/20 border-amber-500/30 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                              }`}
                            title={property.isFeatured ? "Remove featuring" : "Feature this property"}
                          >
                            <Star className={`w-3 h-3 ${property.isFeatured ? "fill-amber-400" : ""}`} /> VIP
                          </button>
                        </div>
                      </td>

                      {/* Status Check */}
                      <td className="px-6 py-4">
                        {getStatusBadge(property.status || "active")}
                      </td>

                      {/* Moderation Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Actions Dropdown / Quick buttons */}
                          {property.status === "pending-review" && (
                            <>
                              <button onClick={() => handleStatusChange(property._id, "active")} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors group" title="Approve">
                                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </button>
                              <button onClick={() => handleStatusChange(property._id, "inactive")} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors group" title="Reject">
                                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              </button>
                            </>
                          )}

                          {property.status === 'active' && (
                            <button onClick={() => handleStatusChange(property._id, "inactive")} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Suspend/Take down">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {property.status === 'inactive' && (
                            <button onClick={() => handleStatusChange(property._id, "active")} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" title="Re-Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          <Link href={`/properties/${property._id}`} target="_blank" className="p-2 ml-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="View Public Page">
                            <Eye className="w-5 h-5" />
                          </Link>
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