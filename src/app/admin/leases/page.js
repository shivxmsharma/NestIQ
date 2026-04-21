import React from "react";
import connectDB from "../../../lib/db";
import Lease from "../../../lib/models/Lease";
import Property from "../../../lib/models/Property";
import User from "../../../lib/models/User";
import { FileText, CheckCircle, Clock, XCircle, Search } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLeasesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();

  // Fetch all leases
  const leases = await Lease.find()
    .populate({
      path: "property",
      select: "title location",
    })
    .populate({
      path: "tenant",
      select: "name email",
    })
    .populate({
      path: "landlord",
      select: "name email",
    })
    .sort({ createdAt: -1 })
    .lean();

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "terminated":
      case "expired":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "terminated":
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-500" />
            Leases & Contracts
          </h1>
          <p className="text-gray-400 mt-1">
            Global oversight of platform agreements and tenancies
          </p>
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leases by ID..."
              disabled
              readOnly
              className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full md:w-80 cursor-not-allowed"
            />
          </div>
          <div className="text-sm text-gray-400 font-semibold bg-white/5 px-4 py-2 rounded-xl">
            {leases.length} Total Leases
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Property</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Tenant / Landlord</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Rent (Monthly)</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Timeline</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                    No leases found on the platform.
                  </td>
                </tr>
              ) : (
                leases.map((lease) => (
                  <tr key={lease._id.toString()} className="hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white whitespace-nowrap">
                          {lease.property?.title || "Property Deleted"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {lease.property?.location?.city || "Unknown Location"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="text-white"><span className="text-gray-500 mr-2">T:</span>{lease.tenant?.name || "Unknown"}</span>
                        <span className="text-white mt-1"><span className="text-gray-500 mr-2">L:</span>{lease.landlord?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-emerald-400">
                          ₹{lease.rentAmount?.toLocaleString('en-IN')}
                        </span>
                        {lease.autoPayEnabled && (
                          <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 bg-indigo-500/10 rounded-md mt-1 w-fit">
                            AutoPay ON
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="text-gray-400">
                          {new Date(lease.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-gray-600">to</span>
                        <span className="text-gray-400">
                          {new Date(lease.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
                          lease.status
                        )}`}
                      >
                        {getStatusIcon(lease.status)}
                        <span className="capitalize">{lease.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/manage/documents`}
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}