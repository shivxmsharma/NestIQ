/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, MessageSquareQuote } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { useSession } from "next-auth/react";

export default function UserReviewsSection({ targetUser, propertyContextId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/users/${targetUser._id}/reviews`);
        const data = await res.json();
        setReviews(data || []);
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    }
    if (targetUser?._id) fetchReviews();
  }, [targetUser]);

  return (
    <div className="bg-[#0b1120] rounded-3xl p-6 border border-white/10 mt-8">
      {/* Header and trust stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
           <h3 className="text-xl font-bold text-white mb-2">Community Reviews</h3>
           {/* Trust Score Block */}
           <div className="flex items-center justify-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 max-w-max gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">Trust Score</span>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white">{targetUser?.trustScore?.toFixed(1) || "New"}</span>
                  <span className="text-sm font-medium text-slate-400 mb-1">/ 5.0</span>
                </div>
              </div>
              <div className="h-10 w-px bg-indigo-500/20"></div>
              <div className="flex flex-col justify-center">
                 <div className="flex text-amber-400 gap-0.5">
                    <Star className="w-5 h-5 fill-current" />
                 </div>
                 <span className="text-xs text-slate-400 mt-1">{targetUser?.reviewCount || 0} Ratings</span>
              </div>
           </div>
        </div>

        {session?.user && session?.user?.id !== targetUser._id && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all"
          >
            <MessageSquareQuote className="w-5 h-5" />
            Write a Review
          </button>
        )}
      </div>

       <div className="border-t border-white/5 pt-6 space-y-4">
        {loading ? (
             <div className="animate-pulse space-y-4">
               <div className="h-24 bg-white/5 rounded-2xl w-full"></div>
             </div>
        ) : reviews.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No public reviews yet.</p>
        ) : (
          reviews.map((r) => (
             <div key={r._id} className="bg-white/5 rounded-2xl p-5 border border-white/5 relative">
              <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    {r.reviewer?.avatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                         <Image src={r.reviewer.avatar} alt="Rev" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {r.reviewer?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white text-sm">{r.reviewer?.name}</p>
                      <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="font-bold text-white text-lg mr-1">{r.rating}</span>
                     {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`} />
                    ))}
                  </div>
              </div>
              <p className="text-slate-300 italic">"{r.comment}"</p>
             </div>
          ))
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetUserId={targetUser._id}
        propertyId={propertyContextId} // Optional context
        onSuccess={(newReview) => setReviews([newReview, ...reviews])}
      />
    </div>
  );
}
