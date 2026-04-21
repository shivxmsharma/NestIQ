import dbConnect from "../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import User from "../../../lib/models/User";
import Review from "../../../lib/models/Review";
import AdminReviewsClient from "../../../components/admin/AdminReviewsClient";

export const metadata = {
  title: "Trust & Reviews | Admin | NestIQ",
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await dbConnect();

  // Fetch all reviews
  const allReviews = await Review.find()
    .populate("reviewer", "name email role avatar")
    .populate("reviewee", "name email role avatar")
    .populate("property", "title location")
    .sort({ createdAt: -1 })
    .lean();

  // Convert for Client Component usage (serialization)
  const plainReviews = allReviews.map((r) => ({
    _id: r._id.toString(),
    reviewer: r.reviewer
      ? { ...r.reviewer, _id: r.reviewer._id.toString() }
      : null,
    reviewee: r.reviewee
      ? { ...r.reviewee, _id: r.reviewee._id.toString() }
      : null,
    property: r.property
      ? { ...r.property, _id: r.property._id.toString() }
      : null,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trust System Moderation</h1>
          <p className="text-slate-400">Monitor community feedback. Flagged or hidden reviews don't count towards user Trust Scores.</p>
        </div>
      </div>
      
      {/* Hand down the data to interactive Client Component */}
      <AdminReviewsClient initialReviews={plainReviews} />
    </div>
  );
}
