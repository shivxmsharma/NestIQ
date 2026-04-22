import Link from "next/link";
import Image from "next/image";
import connectDB from "../../lib/db";
import Builder from "../../lib/models/Builder";
import { BadgeCheck, MapPin, Building2, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Verified Builders Directory | NestIQ",
  description: "Explore top-rated real estate developers and builders. View their current and upcoming projects with verified RERA IDs and trust scores.",
};

async function getBuilders() {
  await connectDB();
  return await Builder.find({ isVerified: true, isActive: true })
    .populate("user", "name email avatar")
    .sort({ isFeatured: -1, totalProjects: -1 })
    .lean();
}

export default async function BuilderDirectoryPage() {
  const builders = await getBuilders();

  return (
    <div className="min-h-screen bg-[#070b14] pb-32 relative">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070b14] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-8">
            <Sparkles size={14} /> Elite Developers
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400">Builders</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Discover verified developers committed to quality, transparency, and architectural excellence in the Tricity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-[-40px] relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {builders.map((builder) => (
            <Link 
              key={builder._id} 
              href={`/builders/${builder.slug}`}
              className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-full shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              {/* Cover Image */}
              <div className="h-44 relative overflow-hidden bg-white/5">
                {builder.coverImage ? (
                  <Image 
                    src={builder.coverImage} 
                    alt={builder.companyName} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent to-transparent opacity-60" />
                
                {/* Logo Overlap */}
                <div className="absolute bottom-[-28px] left-8 p-1.5 bg-[#070b14] border border-white/10 rounded-[1.5rem] shadow-2xl">
                  <div className="relative w-16 h-16 rounded-[1rem] overflow-hidden bg-white/5">
                    {builder.logo ? (
                      <Image src={builder.logo} alt={builder.companyName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="text-slate-500 w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 pt-12 flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors tracking-tight">
                    {builder.companyName}
                  </h3>
                  {builder.isVerified && (
                    <BadgeCheck className="text-emerald-400 w-7 h-7 shrink-0 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-6 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {builder.headquarters?.city}, {builder.headquarters?.state}
                </div>

                <p className="text-slate-400 text-sm line-clamp-2 mb-8 italic leading-relaxed font-light">
                  "{builder.tagline}"
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 py-6 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-white font-black text-xl leading-none tracking-tighter">{builder.totalProjects}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-2">Projects</p>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <p className="text-white font-black text-xl leading-none tracking-tighter">
                      {builder.rating?.average > 0 ? builder.rating.average.toFixed(1) : "—"}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-2">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black text-xl leading-none tracking-tighter">{builder.establishedYear || "—"}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-2">Since</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/5 border-t border-white/5 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-400">
                View Portfolio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
