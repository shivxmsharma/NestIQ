'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Loader2, User, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const STATUS_CONFIG = {
  requested: { label: 'Pending Confirmation', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', icon: CheckCircle },
};

const FILTERS = ['all', 'requested', 'confirmed', 'completed', 'cancelled'];

export default function VisitsPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const isSeller = ['seller', 'broker'].includes(session?.user?.role);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchVisits = async () => {
      try {
        const [sentRes, receivedRes] = await Promise.all([
          fetch('/api/enquiries?type=sent&limit=50'),
          fetch('/api/enquiries?type=received&limit=50')
        ]);

        const sentData = await sentRes.json();
        const receivedData = await receivedRes.json();

        const sentItems = sentData.enquiries || (Array.isArray(sentData) ? sentData : []);
        const receivedItems = receivedData.enquiries || (Array.isArray(receivedData) ? receivedData : []);

        // Deduplicate in case a user is both buyer and seller on the same property (rare but possible)
        const allItems = [...sentItems, ...receivedItems];
        const uniqueItems = Array.from(new Map(allItems.map(item => [item._id, item])).values());

        setVisits(uniqueItems.filter((e) => e.visitDate || e.enquiryType === 'visit'));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [session?.user?.id]);

  async function updateStatus(enquiryId, visitStatus) {
    const res = await fetch(`/api/enquiries/${enquiryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitStatus }),
    });
    if (res.ok) {
      setVisits((prev) =>
        prev.map((v) => (v._id === enquiryId ? { ...v, visitStatus } : v))
      );
    }
  }

  const filtered =
    filter === "all" ? visits : visits.filter((v) => v.visitStatus === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Site Visits</h1>
          <p className="text-sm text-slate-400 mt-1">
            {visits.length} visit{visits.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        {!isSeller && (
          <Link
            href="/properties"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors"
          >
            Browse properties →
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => {
          const count = f === "all" ? visits.length : visits.filter((v) => v.visitStatus === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-300 border ${filter === f
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10"
                }`}
            >
              {f === "all" ? "All" : f}
              <span className={`ml-1.5 text-xs py-0.5 px-2 rounded-full ${filter === f ? "bg-indigo-500/20 text-indigo-200" : "bg-white/10 text-slate-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visit cards */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center py-16 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p className="font-medium text-slate-300 text-lg">No visits found</p>
          {!isSeller && (
            <Link href="/properties" className="text-indigo-400 text-sm hover:underline hover:text-indigo-300 mt-2 inline-block transition-colors">
              Schedule a visit →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((visit) => {
            const cfg = STATUS_CONFIG[visit.visitStatus] || STATUS_CONFIG.requested;
            const Icon = cfg.icon;
            const photo = visit.property?.photos?.[0]?.url;
            const addr = visit.property?.address;

            return (
              <div
                key={visit._id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5 flex flex-col sm:flex-row gap-5 hover:border-white/20 transition-all duration-300 group"
              >
                {/* Property thumbnail */}
                <div className="w-full sm:w-28 h-40 sm:h-28 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 shrink-0 relative group-hover:ring-white/20 transition-all">
                  {photo ? (
                    <Image
                      src={photo}
                      alt="property"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col py-1">
                  <div className="flex items-start justify-between gap-4 mb-2 flex-col sm:flex-row">
                    <Link
                      href={`/properties/${visit.property?._id}`}
                      className="font-semibold text-white text-lg hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                      {addr?.locality ? `${addr.locality}, ${addr.city}` : "Property Listing"}
                    </Link>
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium shrink-0 ${cfg.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Date + time */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3 bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      {new Date(visit.visitDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    {visit.visitTime && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-300" />
                          {visit.visitTime}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Buyer info (for sellers) */}
                  {isSeller && (
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-3 bg-[#0b1120]/50 w-fit px-4 py-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
                          {visit.name?.charAt(0) || 'U'}
                        </div>
                        {visit.name}
                      </div>
                      {visit.phone && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <a href={`tel:${visit.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                            <Phone className="w-4 h-4" />
                            {visit.phone}
                          </a>
                        </>
                      )}
                    </div>
                  )}

                  <div className="grow"></div>

                  {/* Actions */}
                  {isSeller && visit.visitStatus === "requested" && (
                    <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                      <button
                        onClick={() => updateStatus(visit._id, "confirmed")}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-sm font-semibold transition-all duration-300 flex-1 sm:flex-none text-center"
                      >
                        Confirm Visit
                      </button>
                      <button
                        onClick={() => updateStatus(visit._id, "cancelled")}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] text-sm font-semibold transition-all duration-300 flex-1 sm:flex-none text-center"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {isSeller && visit.visitStatus === "confirmed" && (
                    <div className="flex mt-3 sm:mt-0">
                      <button
                        onClick={() => updateStatus(visit._id, "completed")}
                        className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 hover:shadow-[0_0_15px_rgba(79,70,229,0.2)] text-sm font-semibold transition-all duration-300 sm:w-auto w-full"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}