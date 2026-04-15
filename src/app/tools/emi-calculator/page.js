"use client";

import { useState, useMemo } from "react";
import { Calculator, IndianRupee, Percent, Calendar, PieChart } from "lucide-react";
import Link from "next/link";

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(5000000); // 50 Lakhs default
  const [interest, setInterest] = useState(8.5); // 8.5% default
  const [tenure, setTenure] = useState(20); // 20 years default

  const { emi, totalInterest, totalAmount } = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(interest) / 12 / 100;
    const n = parseFloat(tenure) * 12;

    let emiCalc = 0;
    if (p > 0 && r > 0 && n > 0) {
      emiCalc = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else if (p > 0 && n > 0 && r === 0) {
      emiCalc = p / n;
    }

    const totalAmt = emiCalc * n;
    const totalInt = totalAmt - p;

    return {
      emi: emiCalc || 0,
      totalInterest: totalInt || 0,
      totalAmount: totalAmt || 0,
    };
  }, [principal, interest, tenure]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const principalPercentage = totalAmount > 0 ? (principal / totalAmount) * 100 : 100;
  const interestPercentage = totalAmount > 0 ? (totalInterest / totalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0b1120] relative w-full pt-12 pb-24">
      {/* Background glimmers */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-125 h-125 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-slate-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">EMI Calculator</span>
        </nav>

        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
            <Calculator className="w-8 h-8 text-indigo-400" />
            Home Loan EMI Calculator
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base">
            Plan your home purchase smartly. Estimate your monthly installments, total interest output, and structure your finances before buying your dream property.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Inputs Section (Left 7 cols) */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8">

            {/* Principal Input */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-indigo-400" /> Loan Amount
                </label>
                <div className="bg-[#0b1120] border border-white/10 rounded-lg px-4 py-2 flex items-center">
                  <span className="text-slate-400 text-sm mr-1">₹</span>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="bg-transparent text-white font-bold w-28 md:w-32 focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="100000"
                max="50000000"
                step="100000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
                <span>₹1L</span>
                <span>₹5Cr</span>
              </div>
            </div>

            {/* Interest Input */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-rose-400" /> Interest Rate (p.a.)
                </label>
                <div className="bg-[#0b1120] border border-white/10 rounded-lg px-4 py-2 flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    value={interest}
                    onChange={(e) => setInterest(Number(e.target.value))}
                    className="bg-transparent text-white font-bold w-16 md:w-20 focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-slate-400 text-sm ml-1">%</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                step="0.1"
                value={interest}
                onChange={(e) => setInterest(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
                <span>5%</span>
                <span>15%</span>
              </div>
            </div>

            {/* Tenure Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Loan Tenure
                </label>
                <div className="bg-[#0b1120] border border-white/10 rounded-lg px-4 py-2 flex items-center">
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="bg-transparent text-white font-bold w-16 md:w-20 focus:outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-slate-400 text-sm ml-1">Yr</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
                <span>1 Yr</span>
                <span>30 Yrs</span>
              </div>
            </div>

          </div>

          {/* Results Section (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* EMI Highlight Card */}
            <div className="bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 text-center shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]">
              <p className="text-sm font-medium text-indigo-200 mb-2 uppercase tracking-widest">Monthly EMI</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {formatCurrency(emi)}
              </h2>
            </div>

            {/* Breakdown Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex-1">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-purple-400" /> Breakdown
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-sm text-slate-300">Principal Amount</span>
                  </div>
                  <span className="font-semibold text-white">{formatCurrency(principal)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-sm text-slate-300">Total Interest</span>
                  </div>
                  <span className="font-semibold text-white">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-200">Total Amount Payable</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Simple CSS Progress Bar Chart instead of full charting library */}
              <div className="w-full h-8 flex rounded-full overflow-hidden border border-white/10 bg-white/5 relative">
                <div
                  className="h-full bg-indigo-500/80 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white/90"
                  style={{ width: `${principalPercentage}%` }}
                >
                  {principalPercentage > 15 && `${principalPercentage.toFixed(1)}%`}
                </div>
                <div
                  className="h-full bg-rose-500/80 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] font-bold text-white/90"
                  style={{ width: `${interestPercentage}%` }}
                >
                  {interestPercentage > 15 && `${interestPercentage.toFixed(1)}%`}
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-3 px-2 font-medium">
                <span>Principal</span>
                <span>Interest</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}