"use client";

import { useState } from "react";
import { Calculator, MapPin, IndianRupee } from "lucide-react";

export default function StampDutyPage() {
  const [propertyValue, setPropertyValue] = useState(5000000);
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState("chandigarh");

  const calculateDuty = () => {
    // Basic approximate rates for demo purposes
    const rates = {
      chandigarh: { male: 6, female: 4, joint: 5 },
      punjab: { male: 7, female: 5, joint: 6 },
      haryana: { male: 7, female: 5, joint: 6 },
    };

    const percentage = rates[location][gender];
    const dutyAmount = (propertyValue * percentage) / 100;
    const registrationFee = (propertyValue * 1) / 100; // Approx 1% registration

    return {
      percentage,
      dutyAmount,
      registrationFee,
      total: dutyAmount + registrationFee,
    };
  };

  const results = calculateDuty();

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-indigo-500/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-6">
            Stamp Duty <span className="text-indigo-400">Calculator</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Estimate your property registration and stamp duty charges instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Controls */}
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-10">

              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-wide text-slate-300 uppercase flex justify-between">
                  <span>Property Value (₹)</span>
                  <span className="text-indigo-400">₹ {propertyValue.toLocaleString('en-IN')}</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white text-lg font-semibold transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="e.g. 5000000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
                  Buyer Type / Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['male', 'female', 'joint'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setGender(type)}
                      className={`py-3.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${gender === type
                          ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-1 ring-indigo-400"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-wide text-slate-300 uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> State
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white text-lg font-semibold transition-all appearance-none cursor-pointer"
                >
                  <option value="chandigarh">Chandigarh</option>
                  <option value="punjab">Punjab</option>
                  <option value="haryana">Haryana</option>
                </select>
              </div>

            </div>
          </div>

          {/* Results */}
          <div className="bg-linear-to-b from-indigo-900/40 to-[#111827]/80 backdrop-blur-xl border border-indigo-500/20 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">
              Estimated Charges
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <div>
                  <span className="text-slate-400 block font-medium">Stamp Duty ({results.percentage}%)</span>
                </div>
                <span className="text-xl font-semibold text-white">
                  ₹ {results.dutyAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center group">
                <div>
                  <span className="text-slate-400 block font-medium">Registration Fee (1%)</span>
                  <span className="text-xs text-slate-500 mt-1 block">Approximate standard rate</span>
                </div>
                <span className="text-xl font-semibold text-white">
                  ₹ {results.registrationFee.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-8 mt-2 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-lg text-slate-300 font-bold">Total Additional Cost</span>
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-300">
                    ₹ {results.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <p className="text-xs sm:text-sm text-indigo-200/70 leading-relaxed font-medium">
                * Note: These are estimated standard rates. Actual stamp duty might vary slightly based on exact locality, age of the property, municipal rules, and legal surcharges.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
