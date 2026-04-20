import React from "react";
import connectDB from "../../../lib/db";
import Payment from "../../../lib/models/Payment";
import Property from "../../../lib/models/Property";
import Lease from "../../../lib/models/Lease";
import User from "../../../lib/models/User";
import { IndianRupee, CheckCircle, Clock, XCircle, Search, Receipt } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();

  // Fetch all payments
  const payments = await Payment.find()
    .populate({
      path: "property",
      select: "title location",
    })
    .populate({
      path: "lease",
      select: "startDate endDate",
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
      case "paid":
      case "refunded":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Receipt className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "refunded":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case "rent":
        return "Monthly Rent";
      case "security_deposit":
        return "Security Deposit";
      case "maintenance":
        return "Maintenance Fee";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-7 h-7 text-emerald-500" />
            Payments Ledger
          </h1>
          <p className="text-gray-400 mt-1">
            Global financial transactions and reconciliation
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Razorpay ID..."
              disabled
              readOnly
              className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full md:w-80 cursor-not-allowed"
            />
          </div>
          <div className="text-sm text-gray-400 font-semibold bg-white/5 px-4 py-2 rounded-xl">
            {payments.length} Transactions Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Transaction Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Property / Lease</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Participants</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                    No payment history found on the platform.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  return (
                    <tr key={payment._id.toString()} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-white flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-gray-500" />
                            <span className="capitalize">{getPaymentTypeLabel(payment.paymentType)}</span>
                          </span>
                          <span className="text-xs text-gray-500 mt-1 font-mono break-all w-48 truncate">
                            {payment.razorpayPaymentId || "Pending / Offline"}
                          </span>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {new Date(payment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`font-black text-lg ${payment.status === 'refunded' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                            ₹{(payment.amount / 100).toLocaleString('en-IN')}
                          </span>
                          {payment.status === 'refunded' && (
                            <span className="text-xs text-indigo-400/80">Refund Processed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {payment.property?.title || "Property Deleted"}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Lease: {payment.lease ? `${new Date(payment.lease.startDate).toLocaleDateString()} to ${new Date(payment.lease.endDate).toLocaleDateString()}` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="text-white"><span className="text-gray-500 mr-2 text-xs uppercase">From:</span>{payment.tenant?.name || "System"}</span>
                          <span className="text-white mt-1"><span className="text-gray-500 mr-2 text-xs uppercase">To:</span>{payment.landlord?.name || "Platform"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}