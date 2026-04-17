'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  LayoutDashboard, Wrench, FileText, IndianRupee,
  Users, Home, Settings, LogOut, ChevronRight
} from 'lucide-react';

const COMMON_NAV = [
  { href: '/manage', icon: LayoutDashboard, label: 'Overview' },
  { href: '/manage/documents', icon: FileText, label: 'Documents' },
  { href: '/manage/maintenance', icon: Wrench, label: 'Maintenance' },
];

const TENANT_NAV = [
  ...COMMON_NAV,
  { href: '/manage/payments', icon: IndianRupee, label: 'Rent Details' },
];

const LANDLORD_NAV = [
  ...COMMON_NAV,
  { href: '/manage/properties', icon: Home, label: 'My Properties' },
  { href: '/manage/tenants', icon: Users, label: 'Tenants' },
];

export default function ManageSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const isLandlord = ['seller', 'broker'].includes(session.user.role);
  const NAV = isLandlord ? LANDLORD_NAV : TENANT_NAV;

  return (
    <aside className="w-64 shrink-0 hidden md:block flex-col h-full sticky top-24">
      {/* Brand/Portal Header */}
      <div className="bg-emerald-600/10 border border-emerald-500/20 shadow-[0_8px_30px_rgba(16,185,129,0.15)] rounded-3xl p-5 mb-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-white tracking-tight">Tenancy <span className="text-emerald-400">Hub</span></h2>
            <p className="text-xs text-indigo-300/80 uppercase font-bold tracking-widest mt-0.5">
              {isLandlord ? 'Landlord Portal' : 'Resident Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden py-3">
        {NAV.map(({ href, icon: Icon, label }) => {
          const exact = href === '/manage';
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm transition-all duration-300 border-l-4 ${active
                ? 'bg-indigo-500/10 text-indigo-400 font-medium border-indigo-500 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
            >
              <Icon size={18} className={active ? 'text-indigo-400' : 'text-slate-500'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Return to Main Site */}
      <div className="mt-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4" />
          Back to Main Dashboard
        </Link>
      </div>
    </aside>
  );
}