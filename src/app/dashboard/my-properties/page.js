import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/db';
import Property from '../../../lib/models/Property';
import Link from 'next/link';
import { Edit, Eye, MapPin, SearchX, PlusCircle, Building2, Edit3 } from 'lucide-react';
import DeletePropertyButton from '../../../components/dashboard/DeletePropertyButton';

export const metadata = { title: 'My Listings — NestIQ' };

export default async function MyPropertiesPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const properties = await Property.find({ owner: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Listings</h1>
          <p className="text-sm text-slate-400 mt-1">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <Link
          href="/dashboard/list-property"
          className="flex items-center gap-2 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-colors"
        >
          <PlusCircle size={15} /> Add Listing
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-16 text-center">
          <Building2 size={44} className="text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-slate-400">No listings yet</p>
          <p className="text-sm text-slate-500 text-[13px] font-light mt-1 mb-6">List your first property to start reaching buyers.</p>
          <Link
            href="/dashboard/list-property"
            className="inline-flex items-center gap-2 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
          >
            <PlusCircle size={15} /> List a Property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => (
            <div key={p._id.toString()} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl">
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-28 h-22 rounded-xl overflow-hidden shrink-0 bg-white/5">
                  {p.photos?.[0]?.url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Building2 size={22} className="text-gray-300" /></div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white tracking-tight line-clamp-1">
                        {p.title || `${p.details?.bedrooms || ''}BHK ${p.propertyType} in ${p.address?.locality || p.address?.city}`}
                      </h3>
                      <p className="flex items-center gap-1 text-sm text-slate-400 mt-0.5">
                        <MapPin size={12} /> {p.address?.locality}, {p.address?.city}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      p.status === 'sold' ? 'bg-blue-100  text-blue-700' :
                        p.status === 'rented' ? 'bg-purple-100 text-purple-700' :
                          'bg-white/5  text-slate-400'
                      }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-lg font-bold text-blue-700">
                      ₹{p.price?.toLocaleString('en-IN')}
                      {p.listingType === 'rent' && <span className="text-sm font-normal text-slate-400">/mo</span>}
                    </span>
                    <span className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded-lg capitalize">{p.listingType}</span>
                    <span className="text-xs text-slate-500 text-[13px] font-light flex items-center gap-1">
                      <Eye size={11} /> {p.views || 0} views
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <Link href={`/properties/${p._id}`} className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors transition-colors">
                      <Eye size={14} /> View
                    </Link>
                    <Link href={`/dashboard/edit-property/${p._id}`} className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors transition-colors">
                      <Edit3 size={14} /> Edit
                    </Link>
                    <DeletePropertyButton propertyId={p._id.toString()} />
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