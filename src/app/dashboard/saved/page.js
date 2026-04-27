'use client';

import { useState, useEffect } from 'react';
import { Heart, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';
import SafeImage from '../../../components/common/SafeImage';

export default function SavedPropertiesPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/saved')
      .then(r => r.json())
      .then(d => { setSaved(d.saved || []); setLoading(false); });
  }, []);

  async function unsave(propertyId) {
    const res = await fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    if (res.ok) setSaved(prev => prev.filter(p => p._id !== propertyId));
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Properties</h1>
        <p className="text-sm text-slate-400 mt-1">{saved.length} saved</p>
      </div>

      {saved.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-16 text-center">
          <Heart size={44} className="text-gray-300 mx-auto mb-3" />
          <p className="text-slate-400">Nothing saved yet</p>
          <Link href="/properties" className="inline-block mt-4 text-sm text-indigo-400 transition-colors hover:underline">
            Browse properties →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saved.map((p) => (
            <div key={p._id} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
              <div className="relative h-40">
                {p.photos?.[0]?.url
                  ? <SafeImage src={p.photos[0].url} alt="" fill fallbackType="property" fallbackClassName="bg-white/5 text-slate-500" className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Building2 size={32} className="text-gray-300" />
                    </div>
                  )
                }
                <button
                  onClick={() => unsave(p._id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                  title="Remove from saved"
                >
                  <Heart size={15} className="text-red-500 fill-red-500" />
                </button>
                <span className="absolute top-3 left-3 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white text-xs px-2.5 py-1 rounded-lg capitalize font-medium">
                  {p.listingType}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white tracking-tight line-clamp-1">
                  {p.title || `${p.details?.bedrooms || ''}BHK ${p.propertyType}`}
                </h3>
                <p className="text-sm text-slate-500 text-[13px] font-light flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {p.address?.locality}, {p.address?.city}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-blue-700">
                    ₹{p.price?.toLocaleString('en-IN')}
                    {p.listingType === 'rent' && <span className="text-sm font-normal text-slate-500 text-[13px] font-light">/mo</span>}
                  </span>
                  <Link
                    href={`/properties/${p._id}`}
                    className="text-sm bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white px-3 py-1.5 rounded-xl hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
