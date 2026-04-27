"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Home, Users, Search, IndianRupee, FileText, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import SafeImage from "../../../components/common/SafeImage";

export default function Properties() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [submittingLease, setSubmittingLease] = useState(false);
  const [leaseForm, setLeaseForm] = useState({
    tenantEmail: "",
    rentAmount: "",
    securityDeposit: "",
    startDate: "",
    endDate: "",
  });
  const [tenantPreview, setTenantPreview] = useState(null); // { name, email, avatar } | 'not_found' | null
  const lookupRef = useRef(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  // Live tenant email lookup
  useEffect(() => {
    const email = leaseForm.tenantEmail;
    if (!email || !email.includes("@")) {
      setTenantPreview(null);
      return;
    }
    clearTimeout(lookupRef.current);
    lookupRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/lookup?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        setTenantPreview(data.user ? data.user : "not_found");
      } catch {
        setTenantPreview("not_found");
      }
    }, 500);
  }, [leaseForm.tenantEmail]);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/manage/properties");
      if (!res.ok) throw new Error("Failed to load properties");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your properties");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLeaseModal = (prop) => {
    setSelectedProperty(prop);
    setTenantPreview(null);
    setLeaseForm({
      tenantEmail: "",
      rentAmount: prop.price || "",
      securityDeposit: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setShowLeaseModal(true);
  };

  const handleCreateLease = async (e) => {
    e.preventDefault();
    setSubmittingLease(true);

    try {
      const res = await fetch("/api/manage/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: selectedProperty._id,
          ...leaseForm,
          rentAmount: Number(leaseForm.rentAmount),
          securityDeposit: Number(leaseForm.securityDeposit || 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lease");

      toast.success("Lease attached to property!");
      setShowLeaseModal(false);
      fetchProperties(); // Refresh the list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingLease(false);
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLeasesCount = properties.filter(p => p.isOccupied).length;
  const vacantCount = properties.length - activeLeasesCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Properties</h1>
          <p className="text-slate-400 mt-1">Manage your real estate portfolio & occupancy.</p>
        </div>

        <Link
          href="/dashboard/list-property"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30"
        >
          <Home className="w-5 h-5" />
          Add New Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Portfolio</p>
            <p className="text-2xl font-bold text-white mt-1">{properties.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Home className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div>
            <p className="text-sm font-medium text-slate-400">Occupied Units</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{activeLeasesCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-[#0b1120] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div>
            <p className="text-sm font-medium text-slate-400">Vacant Lots</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{vacantCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Home className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Properties Display */}
      <div className="bg-[#0b1120] rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Your Listed Properties</h2>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Loading portfolio...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Properties Found</h3>
            <p className="text-slate-400">You haven&apos;t listed any matching properties.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {filteredProperties.map((prop) => (
              <div key={prop._id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col hover:bg-white/[0.07] transition-all">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative bg-white/10">
                    {prop.photos?.[0]?.url || (typeof prop.photos?.[0] === 'string' && prop.photos[0]) ? (
                      <SafeImage src={prop.photos[0]?.url || prop.photos[0]} alt={prop.title || "Property"} fill fallbackType="property" fallbackClassName="bg-white/10 text-slate-500" className="object-cover" />
                    ) : (
                      <Home className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-lg truncate" title={prop.title}>{prop.title}</h3>
                      {prop.isOccupied ? (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">Occupied</span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20">Vacant</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5 truncate">{prop.location?.address}</p>
                    <p className="text-emerald-400 font-bold mt-2 text-sm flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                      {prop.price?.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  {prop.isOccupied ? (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        {prop.lease?.tenant?.avatar || prop.lease?.tenant?.image ? (
                          <SafeImage src={prop.lease.tenant.avatar || prop.lease.tenant.image} alt="tenant" width={24} height={24} fallbackType="avatar" fallbackClassName="bg-indigo-500/20 text-indigo-400" className="rounded-full" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-slate-300 font-medium truncate">{prop.lease?.tenant?.name || "Rented"}</span>
                      <Link href="/manage/leases" className="text-xs text-indigo-400 hover:text-indigo-300 ml-2 font-bold underline">View Lease</Link>
                    </div>
                  ) : (
                    <div className="w-full flex">
                      <button
                        onClick={() => handleOpenLeaseModal(prop)}
                        className="flex-1 flex justify-center items-center gap-2 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-bold border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Issue a Lease Agreement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Lease Modal */}
      {showLeaseModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-linear-to-r from-emerald-500/10 to-transparent">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Create Digital Lease
              </h2>
              <p className="text-sm text-slate-400 mt-1 truncate">For: {selectedProperty.title}</p>
            </div>

            <form onSubmit={handleCreateLease} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tenant Account Email</label>
                <input
                  type="email"
                  required
                  value={leaseForm.tenantEmail}
                  onChange={(e) => setLeaseForm({ ...leaseForm, tenantEmail: e.target.value })}
                  placeholder="tenant@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 mt-1">The tenant must have registered an account with this email.</p>

                {/* Tenant Preview */}
                {tenantPreview === "not_found" && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-xs text-rose-400 font-medium">⚠ No NestIQ account found with this email.</span>
                  </div>
                )}
                {tenantPreview && tenantPreview !== "not_found" && (
                  <div className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                      {tenantPreview.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{tenantPreview.name}</p>
                      <p className="text-xs text-emerald-400">✓ Verified NestIQ Account</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Rent Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={leaseForm.rentAmount}
                    onChange={(e) => setLeaseForm({ ...leaseForm, rentAmount: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Security Deposit</label>
                  <input
                    type="number"
                    required
                    value={leaseForm.securityDeposit}
                    onChange={(e) => setLeaseForm({ ...leaseForm, securityDeposit: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaseForm.startDate}
                    onChange={(e) => setLeaseForm({ ...leaseForm, startDate: e.target.value })}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min={leaseForm.startDate}
                    value={leaseForm.endDate}
                    onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaseModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLease || !tenantPreview || tenantPreview === "not_found"}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                >
                  {submittingLease ? "Issuing..." : "Issue Lease"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
