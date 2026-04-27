"use client";

import { useState } from "react";
import { Star, ShieldAlert, EyeOff, Eye, UserX, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import SafeImage from "../common/SafeImage";

export default function AdminReviewsClient({ initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [filter, setFilter] = useState("all");

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const loadingToast = toast.loading("Updating review...");
      
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Local optimistic update
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      );
      
      toast.success(data.message, { id: loadingToast });
    } catch (err) {
      toast.error(err.message || "Failed to update review.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "published", "flagged", "hidden"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({reviews.filter(r => f === "all" || r.status === f).length})
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-[#111827]/80 rounded-3xl p-12 text-center border border-white/5">
            <h3 className="text-xl font-semibold text-white mb-2">No reviews found</h3>
            <p className="text-slate-400">There are currently no reviews matching this status.</p>
          </div>
        ) : null}

        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className={`bg-[#0b1120] border ${
              review.status === "flagged" ? "border-amber-500/40" : "border-white/10"
            } rounded-3xl p-6 relative overflow-hidden group transition-all`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              
              {/* Feedback Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-800 text-slate-700"
                      }`}
                    />
                  ))}
                  <span className="text-slate-500 text-sm ml-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  
                  {/* Status pills */}
                  <div className="ml-auto flex items-center">
                    {review.status === "flagged" && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Flagged
                      </span>
                    )}
                    {review.status === "hidden" && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/20 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                    {review.status === "published" && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Public
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-white text-lg leading-relaxed">&quot;{review.comment}&quot;</p>

                {review.property && (
                  <div className="text-sm text-slate-400 bg-white/5 inline-block px-3 py-1.5 rounded-lg">
                    Context: <span className="text-indigo-400">{review.property.title}</span> ({review.property.location.city})
                  </div>
                )}
              </div>

              {/* User Entities Block */}
              <div className="md:w-72 space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Reviewer</span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-indigo-500/20">
                      {review.reviewer?.avatar ? (
                        <SafeImage src={review.reviewer.avatar} alt="Avatar" fill fallbackType="avatar" fallbackClassName="bg-indigo-500/20 text-indigo-400" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {review.reviewer?.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{review.reviewer?.name || "Deleted User"}</p>
                      <p className="text-xs text-slate-400 truncate">{review.reviewer?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold block mb-2">Reviewed User</span>
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-indigo-500/20">
                      {review.reviewee?.avatar ? (
                        <SafeImage src={review.reviewee.avatar} alt="Avatar" fill fallbackType="avatar" fallbackClassName="bg-indigo-500/20 text-indigo-400" className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {review.reviewee?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate">{review.reviewee?.name || "Deleted User"}</p>
                      <p className="text-xs text-slate-400 truncate capitalize">{review.reviewee?.role}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Admin Action Bar */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end gap-3">
               {review.status !== "published" && (
                <button
                  onClick={() => handleUpdateStatus(review._id, "published")}
                  className="px-4 py-2 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 text-sm font-medium rounded-xl transition-colors border border-emerald-500/20 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Restore Public
                </button>
               )}

              {review.status !== "flagged" && (
                <button
                  onClick={() => handleUpdateStatus(review._id, "flagged")}
                  className="px-4 py-2 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 text-sm font-medium rounded-xl transition-colors border border-amber-500/20 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" /> Flag Abuse
                </button>
              )}

              {review.status !== "hidden" && (
                <button
                  onClick={() => handleUpdateStatus(review._id, "hidden")}
                  className="px-4 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-sm font-medium rounded-xl transition-colors border border-red-500/20 flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" /> Hide from Trust Score
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
