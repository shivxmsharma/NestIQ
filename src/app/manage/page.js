"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Copy, PlusCircle, User, Zap, AlertCircle, Building2 } from "lucide-react";
import Image from "next/image";

export default function ManageDashboard() {
  const { data: session } = useSession();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLandlord = ["seller", "broker"].includes(session?.user?.role);

  useEffect(() => {
    async function load() {
      if (!session) return;
      try {
        const res = await fetch("/api/manage/leases");
        const data = await res.json();
        setLeases(data.leases || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  const StatCard = ({ title, value, color }) => (
    <div className={`p-6 rounded-3xl border bg-white/5 backdrop-blur-xl ${color}`}>
      <h3 className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-1.5">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-slate-400 mt-1">Welcome to your property management hub.</p>
        </div>
        {isLandlord && (
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <PlusCircle className="w-5 h-5" />
            Create Lease
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white/5 border border-white/10 rounded-3xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title={isLandlord ? "Active Leases" : "Current Leases"}
              value={leases.filter(l => l.status === 'active').length}
              color="border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
            />
            {isLandlord && (
              <StatCard
                title="Monthly Rent Expectancy"
                value={`₹${(leases.reduce((acc, l) => l.status === 'active' ? acc + l.rentAmount : acc, 0) / 100000).toFixed(1)}L`}
                color="border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              />
            )}
            <StatCard
              title="Open Maintenance"
              value="0"
              color="border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-lg">
            <h2 className="text-xl font-bold text-white tracking-tight mb-6">Recent Activity</h2>
            {leases.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center opacity-70">
                <Building2 className="w-12 h-12 text-slate-500 mb-3" />
                <p className="text-slate-300 font-medium">No active leases found</p>
                <p className="text-sm text-slate-500 mt-1">
                  {isLandlord ? "Create a new lease to get started tracking." : "You do not have any active leased properties."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leases.map((lease) => (
                  <div key={lease._id} className="flex items-center justify-between p-4 bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0">
                        {lease.property?.photos?.[0]?.url ? (
                          <Image src={lease.property.photos[0].url} alt="Property" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Building2 className="w-5 h-5 text-slate-500" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white tracking-tight">{lease.property?.title}</p>
                        <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {isLandlord ? lease.tenant?.name : lease.landlord?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lease.status === 'active' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          lease.status === 'pending' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                        {lease.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}