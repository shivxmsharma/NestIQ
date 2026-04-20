"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPropertyActions({ propertyId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (newStatus) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/properties/${propertyId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      alert("Error updating property status.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "active") {
    return (
      <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-semibold flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Currently Active
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-semibold flex items-center gap-2">
        <XCircle className="w-5 h-5" />
        Rejected
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => handleUpdate("active")}
        disabled={loading}
        className="px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        Approve Listing
      </button>
      <button
        onClick={() => handleUpdate("rejected")}
        disabled={loading}
        className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
        Reject
      </button>
    </>
  );
}