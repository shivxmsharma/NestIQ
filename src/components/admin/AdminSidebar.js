"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Settings,
  LogOut,
  ArrowRight,
  FileText,
  IndianRupee,
  Star
} from "lucide-react";
import Image from "next/image";

export default function AdminSidebar({ user }) {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users & Roles", href: "/admin/users", icon: Users },
    { label: "Properties", href: "/admin/properties", icon: Building2 },
    { label: "Leases & Contracts", href: "/admin/leases", icon: FileText },
    { label: "Payments Ledger", href: "/admin/payments", icon: IndianRupee },
    { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
    { label: "Builders Hub", href: "/admin/builders", icon: ShieldCheck },
    { label: "Reviews & Trust", href: "/admin/reviews", icon: Star },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-80 shrink-0 space-y-6">
      {/* Admin Badging Panel */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="w-24 h-24 text-indigo-500" />
        </div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Superadmin
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || "Admin"}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/50 shadow-xl"
            />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xl shadow-xl">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white max-w-40 truncate">
              {user?.name || "Administrator"}
            </h2>
            <p className="text-sm font-medium text-slate-400 truncate max-w-40">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-3 shadow-2xl flex flex-col h-full space-y-1">
        <div className="px-4 py-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Admin Controls
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${isActive
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {link.label}
              </div>
              {isActive && <ArrowRight className="w-4 h-4 text-white/50" />}
            </Link>
          );
        })}

        <div className="flex-1 py-4" />

        {/* Back to User Dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all duration-300 border border-indigo-500/20 mb-2"
        >
          <LogOut className="w-5 h-5" />
          Exit Admin Panel
        </Link>
      </nav>
    </aside>
  );
}