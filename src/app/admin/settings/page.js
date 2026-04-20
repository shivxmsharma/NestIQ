import { Settings, Shield, Bell, Database } from "lucide-react";
import AdminSettingsForm from "../../../components/admin/AdminSettingsForm";
import dbConnect from "../../../lib/db";
import PlatformSettings from "../../../lib/models/PlatformSettings";

export const metadata = {
  title: "Platform Settings | Admin | NestIQ",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await dbConnect();
  // Fetch singleton settings from database (or create a default one on-the-fly)
  let settings = await PlatformSettings.findOne({});
  if (!settings) {
    settings = await PlatformSettings.create({});
  }

  // Convert to lean object to pass as prop
  const settingsData = {
    platformName: settings.platformName,
    supportEmail: settings.supportEmail,
    maintenanceMode: settings.maintenanceMode,
    autoApproveProperties: settings.autoApproveProperties,
    commissionFeePercentage: settings.commissionFeePercentage,
    maxPropertiesPerUser: settings.maxPropertiesPerUser,
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
          <p className="text-slate-400">
            Manage global configuration, security policies, and performance variables.
          </p>
        </div>
        <div className="p-4 bg-indigo-500/10 rounded-2xl hidden md:block">
          <Settings className="w-8 h-8 text-indigo-400 animate-spin-slow" />
        </div>
      </div>

      {/* Interactive Settings Form Component */}
      <AdminSettingsForm initialSettings={settingsData} />
    </div>
  );
}