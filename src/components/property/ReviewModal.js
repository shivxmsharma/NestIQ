"use client";

import { useState } from "react";
import { Star, MessageSquarePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ReviewModal({
  isOpen,
  onClose,
  targetUserId,
  propertyId,
  onSuccess
}) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user) {
      return toast.error("Please login to leave a review.");
    }
    if (rating === 0) {
      return toast.error("Please select a rating.");
    }
    if (!comment.trim()) {
      return toast.error("Please write a comment.");
    }

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Submitting review...");

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: targetUserId,
          propertyId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message, { id: loadingToast });
      if (onSuccess) onSuccess(data.review);
      onClose();
      // Reset form
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0b1120] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <MessageSquarePlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Leave a Review</h2>
              <p className="text-sm text-slate-400">Share your experience to help the community.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Rating Stars */}
            <div className="space-y-2 text-center">
              <label className="text-sm font-medium text-slate-300 block">Overall Rating</label>
              <div className="flex items-center justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                  >
                    <Star
                      className={`w-9 h-9 ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                          : "fill-slate-800 text-slate-700"
                      } transition-all duration-200`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex justify-between">
                <span>Written Feedback</span>
                <span className="text-slate-500 font-normal">{comment.length}/500</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="What was it like? Be fair and honest..."
                rows={4}
                className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-white font-medium bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 py-3 px-4 rounded-xl text-white font-medium bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
