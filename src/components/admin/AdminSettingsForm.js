"use client";

import { useState } from "react";
import { Save, Globe, Shield, Activity, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminSettingsForm({ initialSettings }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    platformName: initialSettings?.platformName || "NestIQ",
    supportEmail: initialSettings?.supportEmail || "support@nestiq.com",
    maintenanceMode: initialSettings?.maintenanceMode || false,
    autoApproveProperties: initialSettings?.autoApproveProperties || false,
    commissionFeePercentage: initialSettings?.commissionFeePercentage || 5,
    maxPropertiesPerUser: initialSettings?.maxPropertiesPerUser || 10,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("Platform settings updated!");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Globe className="w-32 h-32 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          General Configuration
        </h2>
        <div className="space-y-5 relative z-10 w-full mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-2">
              <label className="block font-medium text-slate-300">Platform Name</label>
              <input
                type="text"
                name="platformName"
                value={formData.platformName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-medium text-slate-300">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
        <hr className="border-white/10 my-6" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="block font-medium text-slate-200">Maintenance Mode</label>
            <p className="text-slate-400 text-sm">Restrict normal user access during major updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={formData.maintenanceMode}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-[#0b1120] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white border border-white/10"></div>
          </label>
        </div>
      </div>

      {/* Property & Security Settings */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Shield className="w-32 h-32 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          Listing & Monetization
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm relative z-10 w-full mb-8">
          <div className="space-y-2">
            <label className="block font-medium text-slate-300">Listing Commission Fee (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              name="commissionFeePercentage"
              value={formData.commissionFeePercentage}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
            <p className="text-slate-500 text-xs">Standard rate used for platform revenue.</p>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-slate-300">Max Properties Per Landlord</label>
            <input
              type="number"
              min="1"
              name="maxPropertiesPerUser"
              value={formData.maxPropertiesPerUser}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
            />
            <p className="text-slate-500 text-xs">A cap on how many properties a user can list.</p>
          </div>
        </div>

        <hr className="border-white/10 my-6" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="block font-medium text-slate-200">Auto-Approve Listings</label>
            <p className="text-slate-400 text-sm">Bypass manual admin approval for newly listed properties</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="autoApproveProperties"
              checked={formData.autoApproveProperties}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-[#0b1120] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white border border-white/10"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving Config..." : "Save Platform Settings"}
        </button>
      </div>
    </div>
  );
}
