"use client";

import { useState } from "react";
import { ShieldCheck, UserX, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminUserStatusActions({ userId, isActive }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggleStatus = async () => {
    try {
      if (!confirm(`Are you sure you want to ${isActive ? "suspend" : "reactivate"} this user completely from the platform?`)) return;

      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");

      router.refresh();
    } catch (error) {
      alert("Error updating user access status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 ${isActive
            ? "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30"
            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
          }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isActive ? <UserX className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />)}
        {isActive ? "Suspend Access" : "Restore Access"}
      </button>
    </>
  );
}