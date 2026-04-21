import { Home } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1120] backdrop-blur-md">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[50px] opacity-20 animate-pulse" />
        
        {/* Animated icon wrapper */}
        <div className="relative w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center animate-bounce shadow-2xl">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/20 blur-sm rounded-b-2xl object-cover" />
          <Home className="w-10 h-10 text-white animate-pulse" />
        </div>
        
        {/* Shadow floor */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/40 blur-md rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
      </div>
    </div>
  );
}
