import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="text-center relative z-10">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 drop-shadow-2xl">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mt-8 mb-4">Location Not Found</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
          We could not locate the property or page you are searching for. It might have been sold, rented, or removed from our listings.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          <Search className="w-5 h-5" />
          Search Active Properties
        </Link>
      </div>
    </div>
  );
}
