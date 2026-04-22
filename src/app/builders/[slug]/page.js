import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "../../../lib/db";
import Builder from "../../../lib/models/Builder";
import Project from "../../../lib/models/Project";
import { 
  BadgeCheck, MapPin, Globe, Link2,
  Building2, Calendar, ShieldCheck, 
  ArrowRight, Users, LayoutGrid, Sparkles
} from "lucide-react";

async function getBuilderData(slug) {
  await connectDB();
  const builder = await Builder.findOne({ slug, isActive: true })
    .populate("user", "name email avatar")
    .lean();
  
  if (!builder) return null;

  const projects = await Project.find({ builder: builder._id })
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();

  return { builder, projects };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBuilderData(slug);
  if (!data) return { title: "Builder Not Found" };
  return {
    title: `${data.builder.companyName} - Projects & Profile | NestIQ`,
    description: data.builder.description?.substring(0, 160),
  };
}

export default async function BuilderProfilePage({ params }) {
  const { slug } = await params;
  const data = await getBuilderData(slug);
  if (!data) notFound();

  const { builder, projects } = data;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 relative">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '60px 60px' }} />

      {/* Cover and Profile Header */}
      <div className="relative h-[450px] w-full">
        {builder.coverImage ? (
          <Image src={builder.coverImage} alt={builder.companyName} fill className="object-cover opacity-60" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-indigo-900/20 to-[#070b14]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 py-16">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-end gap-8">
            <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-8 border-[#070b14] bg-white shadow-2xl shadow-indigo-500/10 shrink-0">
              {builder.logo ? (
                <Image src={builder.logo} alt={builder.companyName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <Building2 className="text-slate-400 w-16 h-16" />
                </div>
              )}
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                  {builder.companyName}
                </h1>
                {builder.isVerified && <BadgeCheck className="text-emerald-400 w-10 h-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />}
              </div>
              <div className="flex flex-wrap items-center gap-8 text-slate-400 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  {builder.headquarters?.city}, {builder.headquarters?.state}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Established in {builder.establishedYear}
                </div>
                {builder.reraId && (
                  <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full text-xs font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                    RERA: {builder.reraId}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        {/* Left Column: About & Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl">
            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wider">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              Developer Profile
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm mb-10 whitespace-pre-wrap font-light">
              {builder.description || "No description provided."}
            </p>

            <div className="flex gap-4">
              {builder.website && (
                <a href={builder.website} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 hover:bg-indigo-500/10 rounded-2xl transition-all border border-white/10 hover:border-indigo-500/30 group">
                  <Globe className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                </a>
              )}
              {builder.socialLinks?.linkedin && (
                <a href={builder.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 hover:bg-indigo-500/10 rounded-2xl transition-all border border-white/10 hover:border-indigo-500/30 group">
                  <Link2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                </a>
              )}
            </div>
          </div>

          {/* Key Stats Card */}
          <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <LayoutGrid size={150} />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Performance Index
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-4xl font-black text-white tracking-tighter">{builder.totalProjects}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-2">Active Projects</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white tracking-tighter">{builder.completedProjects || "—"}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-2">Successful Deliveries</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-400 leading-none">
                      {builder.rating?.average > 0 ? builder.rating.average.toFixed(1) : "N/A"}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-black">User Rating</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projects */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-white tracking-tighter">Active Portfolio</h2>
            <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              {projects.length} Total Assets
            </div>
          </div>

          <div className="grid gap-8">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link 
                  key={project._id} 
                  href={`/builders/projects/${project.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 flex flex-col md:flex-row h-full md:h-72 backdrop-blur-2xl shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                >
                  <div className="w-full md:w-96 h-56 md:h-auto relative overflow-hidden shrink-0">
                    {project.coverImage ? (
                      <Image src={project.coverImage} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Building2 className="text-slate-600" size={40} />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 backdrop-blur-3xl shadow-2xl ${
                        project.status === "Ready to Move" ? "bg-emerald-500/80 text-white" : "bg-indigo-500/80 text-white"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-10 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-indigo-400/10 rounded-md">{project.projectType}</span>
                        {project.isFeatured && <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20 uppercase tracking-widest flex items-center gap-1"><Sparkles size={10}/> Featured</span>}
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3 group-hover:text-indigo-300 transition-colors tracking-tight leading-tight">{project.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        {project.location.locality}, {project.location.city}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                      <div>
                        {project.priceRange?.min > 0 ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-white tracking-tighter">
                              ₹{(project.priceRange.min / 100000).toFixed(1)}L
                            </span>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Onwards</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-black italic text-xs uppercase tracking-widest">Price on Request</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                        Experience <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-24 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
                <LayoutGrid className="mx-auto w-16 h-16 text-slate-700 mb-6 opacity-30" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No active assets listed yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
