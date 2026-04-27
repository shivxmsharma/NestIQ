'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import SafeImage from '../common/SafeImage';
import {
  LayoutDashboard, Building2, MessageSquare,
  Heart, Calendar, PlusCircle, LogOut, ChevronRight,
  MessageCircle, Settings, IndianRupee,
} from 'lucide-react';

const BUYER_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/profile', icon: Settings, label: 'Profile Settings' },
  { href: '/dashboard/saved', icon: Heart, label: 'Saved Properties' },
  { href: '/dashboard/my-enquiries', icon: MessageSquare, label: 'My Enquiries' },
  { href: '/dashboard/payments', icon: IndianRupee, label: 'Rent Payments' },
  { href: '/dashboard/visits', icon: Calendar, label: 'Visits' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Messages', badge: true },
];

const SELLER_EXTRA = [
  { href: '/dashboard/list-property', icon: PlusCircle, label: 'List Property' },
  { href: '/dashboard/my-properties', icon: Building2, label: 'My Listings' },
  { href: '/dashboard/enquiries', icon: MessageSquare, label: 'Received Enquiries' },
];

export default function DashboardSidebar({ user }) {
  const pathname = usePathname();
  const unread = useUnreadCount();

  const isSeller = ['seller', 'broker'].includes(user?.role);
  const NAV = isSeller ? [...BUYER_NAV, ...SELLER_EXTRA] : BUYER_NAV;

  return (
    <aside className="w-60 shrink-0 hidden md:block">
      {/* User card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-5 mb-4">
        <div className="flex items-center gap-3">
          {user?.image ? (
            <SafeImage src={user.image} alt={user.name || ''} width={40} height={40} fallbackType="avatar" fallbackClassName="bg-indigo-500/20 text-indigo-300" className="rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate tracking-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate font-light">{user?.email}</p>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-lg mt-1 capitalize backdrop-blur-sm ${user?.role === 'broker' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              user?.role === 'seller' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                'bg-slate-500/20 text-slate-300 border border-slate-500/30'
              }`}>
              {user?.role || 'buyer'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-[#0b1120]/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden py-2">
        {BUYER_NAV.map(({ href, icon: Icon, label, badge }) => {
          const exact = href === '/dashboard';
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-all duration-300 border-l-4 ${active
                ? 'bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
            >
              <Icon size={16} className={active ? 'text-indigo-400' : 'text-slate-500'} />
              <span className="flex-1">{label}</span>
              {/* Unread badge — only on Messages */}
              {badge && unread > 0 ? (
                <span className="bg-indigo-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : (
                active && <ChevronRight size={14} className="opacity-60" />
              )}
            </Link>
          );
        })}

        {/* Seller Tools */}
        {isSeller && (
          <>
            <div className="px-5 pt-4 pb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seller Tools</p>
            </div>
            {SELLER_EXTRA.map(({ href, icon: Icon, label }) => {
              const exact = href === '/dashboard';
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition-all duration-300 border-l-4 ${active
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                >
                  <Icon size={16} className={active ? 'text-indigo-400' : 'text-slate-500'} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={14} className="opacity-60" />}
                </Link>
              );
            })}
          </>
        )}

        <div className="border-t border-white/10 mt-2 pt-2">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 border-l-4 border-transparent transition-all duration-300 group"
          >
            <LogOut size={16} className="text-red-500/70 group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
}
