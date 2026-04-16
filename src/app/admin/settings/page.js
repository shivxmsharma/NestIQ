import { Save, Bell, Shield, Mail, Globe, Database } from "lucide-react";

export const metadata = {
  title: "Platform Settings | Admin | NestIQ",
};

export default function AdminSettingsPage() {
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
      </div>

      {/* Settings Sections */}
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
          <div className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div className="space-y-2">
                <label className="block font-medium text-slate-300">Platform Name</label>
                <input
                  type="text"
                  defaultValue="NestIQ"
                  className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-slate-300">Support Email</label>
                <input
                  type="email"
                  defaultValue="support@nestiq.com"
                  className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="space-y-2 text-sm z-10 w-full">
              <label className="block font-medium text-slate-300">Maintenance Mode</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#0b1120] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white border border-white/10"></div>
                  </label>
                  <span className="text-slate-400 text-sm">Disable access for non-admin users</span>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-indigo-500 hover:border-transparent text-white font-medium rounded-xl transition-all border border-white/10 ml-4 group">
                  <Save className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-32 h-32 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            Security & Permissions
          </h2>
          <div className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <h3 className="font-semibold text-white">Require Broker Verification</h3>
                  <p className="text-sm text-slate-400 mt-1">Force brokers to verify their RERA ID before listing properties.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[#0b1120] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white border border-white/10"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div>
                  <h3 className="font-semibold text-white">Auto-Approve Listings</h3>
                  <p className="text-sm text-slate-400 mt-1">Skip manual admin review for new properties. (Not Recommended)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#0b1120] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white border border-white/10"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Admin Weekly Reports</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[#0b1120] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white border border-white/10"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Alert on Spam Reports</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-[#0b1120] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white border border-white/10"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Data & Storage
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Cache Active Sync</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/20">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">AWS Image Sync</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/20">Operational</span>
              </div>
              <button className="w-full mt-2 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm border border-white/5 transition-colors">
                Clear System Cache
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}