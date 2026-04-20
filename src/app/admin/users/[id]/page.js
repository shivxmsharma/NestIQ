import React from "react";
import connectDB from "../../../../lib/db";
import User from "../../../../lib/models/User";
import Property from "../../../../lib/models/Property";
import Lease from "../../../../lib/models/Lease";
import Payment from "../../../../lib/models/Payment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User as UserIcon, ShieldAlert, Building2, MapPin, CheckCircle, XCircle, Calendar, Phone, Mail, FileText, IndianRupee, Activity } from "lucide-react";
import AdminUserStatusActions from "../../../../components/admin/AdminUserStatusActions";
import UserReviewsSection from "../../../../components/property/UserReviewsSection";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();
  const { id } = await params;

  // 1. Fetch User
  const user = await User.findById(id).lean();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <UserIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400 mb-6">The user profile you are looking for does not exist.</p>
        <Link href="/admin/users" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  // 2. Fetch Related Data
  const [properties, leases, payments] = await Promise.all([
    Property.find({ owner: id }).sort({ createdAt: -1 }).lean(),
    Lease.find({ $or: [{ tenant: id }, { landlord: id }] }).populate("property", "title").sort({ createdAt: -1 }).lean(),
    Payment.find({ $or: [{ tenant: id }, { landlord: id }] }).sort({ createdAt: -1 }).lean()
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Users Directory
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/30 overflow-hidden relative shadow-lg">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} fill className="object-cover" />
            ) : (
              <span className="text-indigo-400 font-bold text-2xl uppercase">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              {user.name}
              {!user.isActive && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded text-xs font-bold uppercase tracking-wider">
                  Suspended
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm mt-1 uppercase font-semibold tracking-wider">
              {user.role} Account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AdminUserStatusActions userId={user._id.toString()} isActive={user.isActive} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity & Metadata */}
        <div className="space-y-6">
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldAlert className="w-32 h-32 text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-white mb-4 relative z-10">Contact Profile</h2>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-gray-500">Primary Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Phone className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{user.phone || "Not Provided"}</p>
                  <p className="text-xs text-gray-500">Phone</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Calendar className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Joined Platform</p>
                </div>
              </div>
            </div>

            {user.role === "broker" && (
              <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-purple-400">Broker Intelligence</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Agency</span><span className="text-white">{user.agencyName || "Independent"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">RERA ID</span><span className="text-white">{user.reraId || "Pending"}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Platform Activity Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                <Building2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span className="text-2xl font-black text-white">{properties.length}</span>
                <span className="text-xs text-gray-500 block uppercase font-semibold mt-1">Listings</span>
              </div>
              <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <span className="text-2xl font-black text-white">{leases.length}</span>
                <span className="text-xs text-gray-500 block uppercase font-semibold mt-1">Contracts</span>
              </div>
            </div>
          </div>

          {/* User Reviews Section for Admin to see their profile */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl mt-6 p-6">
             <UserReviewsSection targetUser={JSON.parse(JSON.stringify(user))} />
          </div>
        </div>

        {/* Right Column: Audit Logs & Assets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Properties Audit */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 bg-white/2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-500" />
                Listed Properties
              </h2>
            </div>
            <div className="p-0">
              {properties.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No properties listed by this user.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-white/5">
                      {properties.map(prop => (
                        <tr key={prop._id.toString()} className="hover:bg-white/2">
                          <td className="px-5 py-3 font-medium text-white">{prop.title}</td>
                          <td className="px-5 py-3 text-gray-400">{prop.address?.city || "Location unknown"}</td>
                          <td className="px-5 py-3 text-emerald-400 font-semibold">₹{prop.price.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 capitalize text-gray-500">{prop.status}</td>
                          <td className="px-5 py-3 text-right">
                            <Link href={`/admin/properties/${prop._id.toString()}`} className="text-indigo-400 hover:text-indigo-300">Inspect</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Leases Audit */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 bg-white/2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Involved Leases
              </h2>
            </div>
            <div className="p-0">
              {leases.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No leases attached to this user.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-white/5">
                      {leases.map(lease => (
                        <tr key={lease._id.toString()} className="hover:bg-white/2">
                          <td className="px-5 py-3 text-white font-medium">{lease.property?.title || "Property N/A"}</td>
                          <td className="px-5 py-3 text-gray-400">
                            {lease.tenant.toString() === id.toString() ? <span className="text-emerald-400">Tenant</span> : <span className="text-purple-400">Landlord</span>}
                          </td>
                          <td className="px-5 py-3 text-gray-400">{new Date(lease.startDate).toLocaleDateString()} &rarr; {new Date(lease.endDate).toLocaleDateString()}</td>
                          <td className="px-5 py-3 capitalize text-gray-500">{lease.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Financials Audit */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 bg-white/2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-500" />
                Recent Financial Activity
              </h2>
            </div>
            <div className="p-0">
              {payments.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No financial transactions attached to this user.</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-white/5">
                      {payments.map(payment => {
                        const isSender = payment.tenant?.toString() === id.toString();
                        return (
                          <tr key={payment._id.toString()} className="hover:bg-white/2">
                            <td className="px-5 py-3 font-mono text-gray-500 text-xs">{payment.razorpayPaymentId || "Offline"}</td>
                            <td className="px-5 py-3 font-semibold text-white">
                              {isSender ? <span className="text-red-400">-₹{(payment.amount / 100).toLocaleString('en-IN')}</span> : <span className="text-emerald-400">+₹{(payment.amount / 100).toLocaleString('en-IN')}</span>}
                            </td>
                            <td className="px-5 py-3 text-gray-400 capitalize">{(payment.paymentType || "rent").replace("_", " ")}</td>
                            <td className="px-5 py-3 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}