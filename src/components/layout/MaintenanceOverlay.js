import { AlertTriangle, Clock } from "lucide-react";

export default function MaintenanceOverlay() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#070b14]/95 backdrop-blur-md">
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-10 shadow-[0_0_80px_rgba(245,158,11,0.15)] flex flex-col items-center max-w-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-amber-500/0 via-amber-500 to-amber-500/0"></div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-[#0b1120] border border-amber-500/30 p-4 rounded-2xl">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">System Under Maintenance</h1>
        <p className="text-slate-400 mb-8 leading-relaxed max-w-md">
          NestIQ is currently undergoing scheduled upgrades to serve you better. We anticipate completion shortly. Please bear with us while our engineers apply the latest features.
        </p>

        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-300">
          <Clock className="w-4 h-4 text-emerald-400" />
          Estimated downtime: Less than 30 minutes
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-10 flex items-center gap-2 opacity-50">
        <span className="text-2xl tracking-tighter text-white font-semibold">
          Nest<span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">IQ</span>
        </span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-400 text-sm">Platform Upgrade</span>
      </div>
    </div>
  );
}
