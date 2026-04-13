/* eslint-disable react/no-unescaped-entities */
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import connectDB from '../../lib/db';
import Property from '../../lib/models/Property';
import Enquiry from '../../lib/models/Enquiry';
import User from '../../lib/models/User';
import mongoose from 'mongoose';
import Link from 'next/link';
import { Building2, Eye, MessageSquare, Heart, Calendar, PlusCircle, ArrowRight, Search } from 'lucide-react';

async function getBuyerStats(userId) {
  await connectDB();

  const [enquiriesSent, user, visitsScheduled, recentEnquiries] = await Promise.all([
    Enquiry.countDocuments({ buyer: userId }),
    User.findById(userId).select('savedProperties').lean(),
    Enquiry.countDocuments({ buyer: userId, enquiryType: 'visit' }),
    Enquiry.find({ buyer: userId })
      .populate('property', 'title photos address price listingType')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    savedCount: user?.savedProperties?.length || 0,
    enquiriesSent,
    visitsScheduled,
    recentEnquiries,
  };
}

async function getSellerStats(userId) {
  await connectDB();
  const oid = new mongoose.Types.ObjectId(userId);

  const [
    myListings, activeListings,
    enquiriesReceived, unreadEnquiries,
    recentEnquiries, recentListings, viewsAgg,
  ] = await Promise.all([
    Property.countDocuments({ owner: userId }),
    Property.countDocuments({ owner: userId, status: 'active' }),
    Enquiry.countDocuments({ owner: userId }),
    Enquiry.countDocuments({ owner: userId, isRead: false }),
    Enquiry.find({ owner: userId })
      .populate('property', 'title')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 }).limit(5).lean(),
    Property.find({ owner: userId }).sort({ createdAt: -1 }).limit(4).lean(),
    Property.aggregate([
      { $match: { owner: oid } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]),
  ]);

  return {
    myListings, activeListings,
    enquiriesReceived, unreadEnquiries,
    totalViews: viewsAgg[0]?.total || 0,
    recentEnquiries,
    recentListings,
  };
}

const COLOR = {
  blue: { bg: 'bg-indigo-500/10 border-indigo-500/20 shadow-[inset_0_0_15px_rgba(79,70,229,0.1)]', icon: 'text-indigo-400', val: 'text-indigo-300' },
  purple: { bg: 'bg-purple-500/10 border-purple-500/20 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]', icon: 'text-purple-400', val: 'text-purple-300' },
  green: { bg: 'bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]', icon: 'text-emerald-400', val: 'text-emerald-300' },
  rose: { bg: 'bg-rose-500/10 border-rose-500/20 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)]', icon: 'text-rose-400', val: 'text-rose-300' },
  orange: { bg: 'bg-amber-500/10 border-amber-500/20 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]', icon: 'text-amber-400', val: 'text-amber-300' },
  teal: { bg: 'bg-teal-500/10 border-teal-500/20 shadow-[inset_0_0_15px_rgba(20,184,166,0.1)]', icon: 'text-teal-400', val: 'text-teal-300' },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isSeller = ['seller', 'broker'].includes(session.user.role);
  const stats = isSeller
    ? await getSellerStats(session.user.id)
    : await getBuyerStats(session.user.id);

  const firstName = session.user.name?.split(' ')[0];

  // ── BUYER VIEW ──────────────────────────────────────────────────
  if (!isSeller) {
    const cards = [
      { label: 'Saved Properties', value: stats.savedCount, sub: 'in your wishlist', icon: Heart, color: 'rose', href: '/dashboard/saved' },
      { label: 'Enquiries Sent', value: stats.enquiriesSent, sub: 'to owners', icon: MessageSquare, color: 'blue', href: '/dashboard/my-enquiries' },
      { label: 'Visits Scheduled', value: stats.visitsScheduled, sub: 'requested', icon: Calendar, color: 'teal', href: '/dashboard/visits' },
    ];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {firstName}! 👋</h1>
            <p className="text-slate-400 text-sm mt-1">Find your next home on NestIQ</p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:flex items-center gap-2 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-colors"
          >
            <Search size={15} /> Browse Properties
          </Link>
        </div>

        {/* 3 buyer stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cards.map(({ label, value, sub, icon: Icon, color, href }) => {
            const c = COLOR[color];
            return (
              <Link key={label} href={href} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${c.val}`}>{value}</p>
                    <p className="text-xs text-slate-500 text-[13px] font-light mt-1">{sub}</p>
                  </div>
                  <div className={`flex items-center justify-center ${c.bg} w-12 h-12 rounded-2xl border`}><Icon size={18} className={c.icon} /></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent enquiries sent */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white tracking-tight">Recent Enquiries</h2>
            <Link href="/dashboard/my-enquiries" className="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {stats.recentEnquiries.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 text-[13px] font-light mb-3">No enquiries sent yet</p>
              <Link href="/properties" className="text-sm text-indigo-400 transition-colors font-medium hover:underline">
                Browse properties to get started →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentEnquiries.map((e) => (
                <div key={e._id.toString()} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 shadow-sm hover:bg-white/10 transition-colors">
                  <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-[#0b1120]/50 border border-white/5 shadow-inner">
                    {e.property?.photos?.[0]?.url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={e.property.photos[0].url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Building2 size={14} className="text-slate-500 text-[13px] font-light" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{e.property?.title || 'Property'}</p>
                    <p className="text-xs text-slate-500 text-[13px] font-light">{e.property?.address?.locality}, {e.property?.address?.city}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${e.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    e.status === 'responded' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-500/20  text-slate-400'
                    }`}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SELLER VIEW ─────────────────────────────────────────────────
  const cards = [
    { label: 'My Listings', value: stats.myListings, sub: `${stats.activeListings} active`, icon: Building2, color: 'blue', href: '/dashboard/my-properties' },
    { label: 'Total Views', value: stats.totalViews, sub: 'across all listings', icon: Eye, color: 'purple', href: '/dashboard/my-properties' },
    { label: 'Enquiries Received', value: stats.enquiriesReceived, sub: `${stats.unreadEnquiries} unread`, icon: MessageSquare, color: 'green', href: '/dashboard/enquiries' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {firstName}! 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening with your properties</p>
        </div>
        <Link
          href="/dashboard/list-property"
          className="hidden sm:flex items-center gap-2 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-colors"
        >
          <PlusCircle size={15} /> List Property
        </Link>
      </div>

      {/* 3 seller stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, sub, icon: Icon, color, href }) => {
          const c = COLOR[color];
          return (
            <Link key={label} href={href} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${c.val}`}>{value}</p>
                  <p className="text-xs text-slate-500 text-[13px] font-light mt-1">{sub}</p>
                </div>
                <div className={`flex items-center justify-center ${c.bg} w-12 h-12 rounded-2xl border`}><Icon size={18} className={c.icon} /></div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two panel row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent enquiries received */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white tracking-tight">Recent Enquiries</h2>
            <Link href="/dashboard/enquiries" className="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {stats.recentEnquiries.length === 0 ? (
            <p className="text-sm text-slate-500 text-[13px] font-light text-center py-10">No enquiries yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentEnquiries.map((e) => (
                <div key={e._id.toString()} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 shadow-sm hover:bg-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-[inset_0_0_10px_rgba(79,70,229,0.1)] text-sm shrink-0">
                    {e.buyer?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{e.buyer?.name || 'Buyer'}</p>
                    <p className="text-xs text-slate-500 text-[13px] font-light truncate">{e.property?.title || 'Property'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${e.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    e.status === 'responded' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-500/20  text-slate-400'
                    }`}>
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent listings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white tracking-tight">My Listings</h2>
            <Link href="/dashboard/my-properties" className="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {stats.recentListings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 text-[13px] font-light mb-3">No listings yet</p>
              <Link href="/dashboard/list-property" className="text-sm text-indigo-400 transition-colors font-medium hover:underline">
                + Add your first property
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentListings.map((p) => (
                <div key={p._id.toString()} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 shadow-sm hover:bg-white/10 transition-colors">
                  <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-[#0b1120]/50 border border-white/5 shadow-inner">
                    {p.photos?.[0]?.url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Building2 size={16} className="text-slate-500 text-[13px] font-light" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {p.title || `${p.details?.bedrooms || ''}BHK ${p.propertyType} — ${p.address?.locality}`}
                    </p>
                    <p className="text-xs text-slate-500 text-[13px] font-light">₹{p.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    p.status === 'sold' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                      'bg-slate-500/20  text-slate-400'
                    }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

