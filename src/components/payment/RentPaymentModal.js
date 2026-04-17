"use client";

import { useState } from "react";
import { X, CreditCard, Calendar, IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function RentPaymentModal({ property, onClose }) {
  const currentDate = new Date();
  const [rentMonth, setRentMonth] = useState(currentDate.getMonth() + 1);
  const [rentYear, setRentYear] = useState(currentDate.getFullYear());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [errorMsg, setErrorMsg] = useState("");

  const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

  async function handlePay() {
    setLoading(true);
    setStatus(null);
    setErrorMsg("");
    try {
      // 1. Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property._id, rentMonth, rentYear, notes }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Load Razorpay script dynamically
      await loadRazorpayScript();

      // 3. Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "NestIQ",
          description: `Rent — ${MONTHS[rentMonth - 1]} ${rentYear}`,
          order_id: orderData.orderId,
          theme: { color: "#10b981" },
          handler: async function (response) {
            // 4. Verify
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) { reject(new Error(verifyData.error)); return; }
            resolve();
          },
          modal: {
            ondismiss: () => reject(new Error("DISMISSED")),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      setStatus("success");
    } catch (err) {
      if (err.message !== "DISMISSED") {
        setStatus("error");
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Pay Rent Online</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property info */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 cursor-default">Paying rent for</p>
            <p className="font-bold text-white text-lg capitalize mb-2">
              {property.propertyType} — {property.address.locality}, {property.address.city}
            </p>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold tracking-wide">
                {property.price.toLocaleString("en-IN")}/mo
              </span>
            </div>
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 cursor-pointer">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-400 ml-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 mb-0.5 opacity-70" />Month
              </label>
              <select
                value={rentMonth}
                onChange={(e) => setRentMonth(Number(e.target.value))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 cursor-pointer">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-400 ml-1">Year</label>
              <select
                value={rentYear}
                onChange={(e) => setRentYear(Number(e.target.value))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
              >
                {years.map((y) => <option key={y} value={y} className="bg-slate-900 text-white">{y}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 focus-within:text-emerald-400 text-slate-400 transition-colors">
            <label className="text-xs font-semibold tracking-wider uppercase ml-1">Note (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. including electricity"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder-slate-600"
            />
          </div>

          {/* Status messages */}
          {status === "success" && (
            <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold tracking-wide">Payment successful! Receipt sent to your email.</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold tracking-wide">{errorMsg}</p>
            </div>
          )}

          {/* Pay button */}
          {status !== "success" && (
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold tracking-wide py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:active:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5 opacity-90" />
              )}
              {loading ? "Processing..." : `Pay ₹${property.price.toLocaleString("en-IN")}`}
            </button>
          )}

          {status === "success" && (
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold tracking-wide py-3.5 px-4 rounded-xl transition-all active:scale-95 border border-white/10"
            >
              Close
            </button>
          )}

          <p className="text-center text-xs text-gray-400">
            Secured by Razorpay · 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}