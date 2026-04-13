'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    Promise.all([
      fetch('/api/enquiries?type=sent').then(r => r.json()),
      fetch('/api/enquiries?type=received').then(r => r.json()),
    ]).then(([sent, received]) => {
      const all = [
        ...(sent.enquiries || []).filter(e => e.enquiryType === 'visit').map(v => ({ ...v, role: 'buyer' })),
        ...(received.enquiries || []).filter(e => e.enquiryType === 'visit').map(v => ({ ...v, role: 'owner' })),
      ];
      setVisits(all);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const upcoming = visits.filter(v => !v.visitDate || new Date(v.visitDate) >= now);
  const past = visits.filter(v => v.visitDate && new Date(v.visitDate) < now);
  const shown = tab === 'upcoming' ? upcoming : past;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Visits</h1>
        <p className="text-sm text-slate-400 mt-1">All scheduled property visits</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'upcoming', count: upcoming.length },
          { key: 'past', count: past.length },
        ].map(({ key, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${tab === key
              ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
          >
            {key} ({count})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-16 text-center">
          <Calendar size={44} className="text-gray-300 mx-auto mb-3" />
          <p className="text-slate-400">No {tab} visits</p>
          {tab === 'upcoming' && (
            <Link href="/properties" className="inline-block mt-4 text-sm text-indigo-400 transition-colors hover:underline">
              Browse properties to schedule a visit →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((v) => (
            <div key={v._id} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${v.visitStatus === 'confirmed' ? 'bg-emerald-500/20' :
                  v.visitStatus === 'cancelled' ? 'bg-rose-500/20' : 'bg-indigo-500/20'
                  }`}>
                  <Calendar size={22} className={
                    v.visitStatus === 'confirmed' ? 'text-emerald-400' :
                      v.visitStatus === 'cancelled' ? 'text-rose-400' : 'text-indigo-400'
                  } />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/properties/${v.property?._id}`}
                        className="font-semibold text-white tracking-tight hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {v.property?.title || 'Property'}
                      </Link>
                      {v.property?.address && (
                        <p className="text-sm text-slate-500 text-[13px] font-light flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          {v.property.address.locality}, {v.property.address.city}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 capitalize ${v.visitStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      v.visitStatus === 'cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        v.visitStatus === 'completed' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                      {v.visitStatus || 'requested'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap">
                    {v.visitDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {new Date(v.visitDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {v.visitTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} /> {v.visitTime}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${v.role === 'buyer' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                      }`}>
                      {v.role === 'buyer'
                        ? 'You requested'
                        : `Requested by ${v.buyer?.name || 'buyer'}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}