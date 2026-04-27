'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, MapPin, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import SafeImage from '../../../components/common/SafeImage';

export default function MyEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/enquiries?type=sent')
      .then(r => r.json())
      .then(d => { setEnquiries(d.enquiries || []); setLoading(false); });
  }, []);

  async function closeEnquiry(id) {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    if (res.ok) {
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: 'closed' } : e));
    }
  }

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
        <h1 className="text-2xl font-bold text-white tracking-tight">My Enquiries</h1>
        <p className="text-sm text-slate-400 mt-1">{enquiries.length} enquir{enquiries.length !== 1 ? 'ies' : 'y'} sent</p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-16 text-center">
          <MessageSquare size={44} className="text-gray-300 mx-auto mb-3" />
          <p className="text-slate-400">No enquiries sent yet</p>
          <Link href="/properties" className="inline-block mt-4 text-sm text-indigo-400 transition-colors hover:underline">
            Browse properties →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <div key={e._id} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5">
              <div className="flex gap-4">
                {/* Property thumb */}
                <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-white/5">
                  {e.property?.photos?.[0]?.url
                    ? <SafeImage src={e.property.photos[0].url} alt="" fill fallbackType="property" fallbackClassName="bg-white/5 text-slate-500" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🏠</div>
                  }
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/properties/${e.property?._id}`}
                        className="font-semibold text-white tracking-tight hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {e.property?.title || 'Property'}
                      </Link>
                      {e.property?.address && (
                        <p className="text-sm text-slate-500 text-[13px] font-light flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          {e.property.address.locality}, {e.property.address.city}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 capitalize ${e.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        e.status === 'responded' ? 'bg-green-100  text-green-700' :
                          'bg-white/5  text-slate-400'
                      }`}>
                      {e.status}
                    </span>
                  </div>

                  {e.message && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{e.message}</p>
                  )}

                  {/* Owner's reply */}
                  {e.ownerResponse && (
                    <div className="mt-2 bg-green-50 border border-green-100 p-3 rounded-xl">
                      <p className="text-xs text-green-600 font-semibold mb-1">Owner replied:</p>
                      <p className="text-sm text-gray-700">{e.ownerResponse}</p>
                    </div>
                  )}

                  {/* Visit info */}
                  {e.enquiryType === 'visit' && e.visitDate && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
                      <Calendar size={13} className="text-purple-500" />
                      Visit: {new Date(e.visitDate).toLocaleDateString('en-IN')}
                      {e.visitTime && ` · ${e.visitTime}`}
                      {e.visitStatus && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-1 ${e.visitStatus === 'confirmed' ? 'bg-green-100  text-green-700' :
                            e.visitStatus === 'cancelled' ? 'bg-red-100    text-red-500' :
                              'bg-purple-100 text-purple-700'
                          }`}>
                          {e.visitStatus}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-500 text-[13px] font-light">
                      {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {e.status !== 'closed' && (
                      <button
                        onClick={() => closeEnquiry(e._id)}
                        className="flex items-center gap-1 text-xs text-slate-500 text-[13px] font-light hover:text-red-500 transition-colors"
                      >
                        <X size={12} /> Close
                      </button>
                    )}
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
