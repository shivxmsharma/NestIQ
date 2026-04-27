/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Users,
  Search,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Building,
  User as UserIcon,
  RefreshCw
} from "lucide-react";

import Link from "next/link";
import SafeImage from "../../../components/common/SafeImage";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

    } catch (err) {
      alert(err.message);
      // Revert if failed
      fetchUsers();
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "broker": return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "seller": return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      default: return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <ShieldAlert className="w-3.5 h-3.5" />;
      case "broker": return <Building className="w-3.5 h-3.5" />;
      case "seller": return <UserIcon className="w-3.5 h-3.5" />;
      default: return <ShieldCheck className="w-3.5 h-3.5" />;
    }
  };

  // Filter based on search query
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-400" />
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Control platform access, verify users, and assign roles.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xl"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Loading user database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-red-500/5">
            {error}. Are you sure you're an admin?
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">User Identity</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Contact / Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Platform Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/2 transition-colors group">
                      {/* Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <SafeImage
                              src={user.avatar}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              fallbackType="avatar"
                              fallbackClassName="bg-indigo-500/20 text-indigo-400"
                              className="w-10 h-10 rounded-full object-cover shadow-md border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                              {user.name?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {user.name}
                            </div>
                            {user.isVerified && (
                              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-300">{user.email}</div>
                        {user.phone ? (
                          <div className="text-xs text-slate-500 mt-1">{user.phone}</div>
                        ) : (
                          <div className="text-xs text-slate-600 italic mt-1">No phone added</div>
                        )}
                      </td>

                      {/* Role Badge & Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={user.role || "buyer"}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`appearance-none bg-transparent ${getRoleBadgeColor(user.role || "buyer")} px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 hover:opacity-80 transition-opacity`}
                        >
                          <option value="admin" className="bg-[#0b1120] text-red-400">Admin</option>
                          <option value="broker" className="bg-[#0b1120] text-purple-400">Broker</option>
                          <option value="seller" className="bg-[#0b1120] text-amber-400">Seller</option>
                          <option value="buyer" className="bg-[#0b1120] text-emerald-400">Buyer</option>
                        </select>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "Unknown"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.createdAt ? format(new Date(user.createdAt), "h:mm a") : ""}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/users/${user._id.toString()}`}
                          className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors inline-block"
                        >
                          <MoreVertical className="w-5 h-5 mx-auto" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
