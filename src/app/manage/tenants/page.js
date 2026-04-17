'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Users, Phone, Mail, MessageSquare, Home, Filter, Activity, Clock, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function TenantsPage() {
  const { data: session, status } = useSession();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active', 'past', 'all'

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTenants();
    }
  }, [status]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/manage/leases');
      const data = await res.json();

      if (data.success) {
        // Group leases by tenant or structure it sequentially. 
        // For simplicity, we wrap each lease iteration as a tenant profile.
        setTenants(data.leases);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Loading directory...</div>;
  }

  if (!session?.user || !['seller', 'broker'].includes(session.user.role)) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10">
        <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Unauthorized</h2>
        <p className="text-slate-400">Only landlords can access the tenants directory.</p>
      </div>
    );
  }

  const filteredTenants = tenants.filter(lease => {
    if (filter === 'all') return true;
    if (filter === 'active') return lease.status === 'active';
    if (filter === 'past') return ['expired', 'terminated'].includes(lease.status);
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Tenants Directory</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-lg">
              Manage your tenants across all your properties. Access contact info, lease status, and quick communication.
            </p>
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
            {['active', 'past', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 text-sm font-medium rounded-lg capitalize transition-all ${filter === f
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5 border border-white/10">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Tenants Found</h3>
          <p className="text-slate-400 max-w-sm mb-6">
            {filter === 'active'
              ? "You don't have any active tenants right now. Issue a lease to get started."
              : `No ${filter} tenants exist in your records.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTenants.map(lease => {
            const tenant = lease.tenant;
            if (!tenant) return null;

            const isActive = lease.status === 'active';

            return (
              <div key={lease._id} className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative bg-white/10 border border-white/20 shrink-0">
                      {tenant.avatar ? (
                        <Image src={tenant.avatar} alt={tenant.name} fill className="object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-300">
                          {tenant.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight leading-tight">{tenant.name}</h3>
                      <div className={`flex items-center gap-1.5 mt-1 text-[10px] uppercase tracking-wider font-bold ${isActive ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                        {isActive ? <Activity size={12} /> : <LogOut size={12} />}
                        {lease.status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-2 text-sm flex-1">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{tenant.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{tenant.phone || 'Phone not provided'}</span>
                  </div>
                  <div className="my-4 h-px bg-white/5" />
                  <div className="flex items-start gap-3 text-slate-300">
                    <Home className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="block font-medium text-white truncate">{lease.property?.title}</span>
                      <span className="text-xs text-slate-400 truncate block mt-0.5">
                        {lease.property?.address?.locality}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-xs font-medium">
                      {format(new Date(lease.startDate), 'MMM dd, yy')} - {format(new Date(lease.endDate), 'MMM dd, yy')}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 flex gap-3">
                  <a
                    href={`mailto:${tenant.email}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <button
                    onClick={() => alert(`Starting chat with ${tenant.name}...`)}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-sm font-medium transition-all"
                    title="Message Tenant"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
