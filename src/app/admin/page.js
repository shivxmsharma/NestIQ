import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Admin Overview | NestIQ",
};

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
          <p className="text-slate-400">
            Welcome back to the command center. Monitor platform vitals from here.
          </p>
        </div>
      </div>

      {/* Grid for Stats Cards - MOCKED FOR NOW */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-24 h-24 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Active Users</p>
          <h2 className="text-4xl font-black text-white">1,482</h2>
          <div className="mt-4 text-sm font-medium text-emerald-400">
            +12% this week
          </div>
        </div>

        {/* Pending Properties */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">Pending Approval</p>
          <h2 className="text-4xl font-black text-white">34</h2>
          <div className="mt-4 text-sm font-medium text-amber-500/80">
            Requires attention
          </div>
        </div>

        {/* Active Properties */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Live Listings</p>
          <h2 className="text-4xl font-black text-white">8,409</h2>
          <div className="mt-4 text-sm font-medium text-slate-400">
            Platform wide
          </div>
        </div>

        {/* Total Enquiries */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert className="w-24 h-24 text-purple-500" />
          </div>
          <p className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Platform Leads</p>
          <h2 className="text-4xl font-black text-white">42.1k</h2>
          <div className="mt-4 text-sm font-medium text-emerald-400">
            +5% match rate
          </div>
        </div>
      </div>

      {/* Activity Feed Placeholder */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-slate-300 flex-1">
              <span className="font-semibold text-white">Rahul Sharma</span> registered as a <span className="text-indigo-400 font-semibold">Broker</span>
            </p>
            <span className="text-xs text-slate-500">2 mins ago</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <p className="text-sm text-slate-300 flex-1">
              <span className="font-semibold text-white">Luxury Villa in Sec-10</span> is awaiting approval.
            </p>
            <span className="text-xs text-slate-500">14 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}