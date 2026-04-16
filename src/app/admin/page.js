import { ShieldAlert, Users, Home, AlertCircle, MessageSquare } from "lucide-react";
import connectDB from "../../lib/db";
import User from "../../lib/models/User";
import Property from "../../lib/models/Property";
import Enquiry from "../../lib/models/Enquiry";

export const metadata = {
  title: "Admin Overview | NestIQ",
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default async function AdminOverview() {
  await connectDB();

  const [
    totalUsers,
    pendingProperties,
    activeProperties,
    totalEnquiries,
    recentUsers,
    recentProperties,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments({ status: "pending-review" }),
    Property.countDocuments({ status: "active" }),
    Enquiry.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    Property.find({ status: "pending-review" }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const activities = [
    ...recentUsers.map((u) => ({
      _id: u._id.toString() + "-user",
      type: "user",
      title: (
        <>
          <span className="font-semibold text-white">{u.name}</span> registered as a <span className="text-indigo-400 font-semibold capitalize">{u.role}</span>
        </>
      ),
      time: u.createdAt,
      color: "bg-indigo-500",
    })),
    ...recentProperties.map((p) => ({
      _id: p._id.toString() + "-prop",
      type: "property",
      title: (
        <>
          <span className="font-semibold text-white">{p.title}</span> is awaiting approval.
        </>
      ),
      time: p.createdAt,
      color: "bg-amber-500",
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

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

      {/* Grid for Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Active Users</p>
          <h2 className="text-4xl font-black text-white">{totalUsers.toLocaleString()}</h2>
          <div className="mt-4 text-sm font-medium text-indigo-500/80">
            Registered on platform
          </div>
        </div>

        {/* Pending Properties */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">Pending Approval</p>
          <h2 className="text-4xl font-black text-white">{pendingProperties.toLocaleString()}</h2>
          <div className="mt-4 text-sm font-medium text-amber-500/80">
            Requires attention
          </div>
        </div>

        {/* Active Properties */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Home className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Live Listings</p>
          <h2 className="text-4xl font-black text-white">{activeProperties.toLocaleString()}</h2>
          <div className="mt-4 text-sm font-medium text-emerald-500/80">
            Platform wide active properties
          </div>
        </div>

        {/* Total Enquiries */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MessageSquare className="w-24 h-24 text-purple-500" />
          </div>
          <p className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Total Enquiries</p>
          <h2 className="text-4xl font-black text-white">{totalEnquiries.toLocaleString()}</h2>
          <div className="mt-4 text-sm font-medium text-purple-500/80">
            Platform communications
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="flex flex-col gap-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                <p className="text-sm text-slate-300 flex-1">
                  {activity.title}
                </p>
                <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(activity.time)}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm italic">No recent activity detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}