import { notFound as nextNotFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  BadgeCheck, MapPin, Calendar, Building2, 
  Download, ArrowRight, Info, CheckCircle2,
  Clock, Ruler, IndianRupee, Layers, LayoutGrid, Sparkles,
  ShieldCheck, Home
} from "lucide-react";
import ProjectInterestForm from "../../../../components/builders/ProjectInterestForm";
import connectDB from "../../../../lib/db";
import Builder from "../../../../lib/models/Builder";
import Project from "../../../../lib/models/Project";

async function getProject(slug) {
  await connectDB();
  const project = await Project.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate({ 
      path: "builder", 
      select: "companyName slug logo coverImage tagline isVerified rating headquarters" 
    })
    .lean();
    
  if (!project) return null;
  
  // Serialize IDs for client components
  return JSON.parse(JSON.stringify(project));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };
  return { 
    title: `${project.title} | NestIQ New Launches`,
    description: project.description?.substring(0, 160)
  };
}

const STATUS_COLORS = {
  "Upcoming": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Under Construction": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Ready to Move": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Completed": "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) nextNotFound();

  const builder = project.builder;

  return (
    <div className="min-h-screen bg-[#070b14] pb-32 text-slate-300 relative">
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '60px 60px' }} />

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Hero Image Section */}
            <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden border border-white/10 group shadow-2xl shadow-indigo-500/5">
              {project.coverImage ? (
                <Image 
                  src={project.coverImage} 
                  alt={project.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90" 
                  priority 
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-indigo-900/20 to-[#070b14] flex items-center justify-center">
                  <Building2 size={80} className="text-slate-800" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent opacity-100" />
              
              <div className="absolute bottom-12 left-12 right-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-3xl shadow-2xl ${STATUS_COLORS[project.status]}`}>
                    {project.status}
                  </span>
                  {project.isReraVerified && (
                    <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-3xl flex items-center gap-2">
                       RERA Verified
                    </span>
                  )}
                  <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 text-white border border-white/20 backdrop-blur-3xl">
                    {project.projectType}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 text-slate-400 text-lg font-medium">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  {project.location?.locality}, {project.location?.city}
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { 
                  icon: IndianRupee, 
                  label: "Price Value", 
                  value: `₹${(project.priceRange?.min / 100000)?.toFixed(0)}L Onwards`,
                  color: "text-indigo-400"
                },
                { 
                  icon: Layers, 
                  label: "Total Units", 
                  value: project.totalUnits || "Exclusive",
                  color: "text-purple-400"
                },
                { 
                  icon: Home, 
                  label: "Possession", 
                  value: project.possessionDate ? new Date(project.possessionDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "TBD",
                  color: "text-emerald-400"
                },
                { 
                  icon: LayoutGrid, 
                  label: "Status", 
                  value: project.status,
                  color: "text-indigo-400"
                },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-2xl shadow-xl hover:border-white/20 transition-all">
                  <s.icon className={`w-5 h-5 ${s.color} mb-4`} />
                  <div className="text-xl font-black text-white tracking-tighter truncate leading-none">{s.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sections */}
            <div className="space-y-16">
              
              {/* About Section */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Architectural Philosophy</h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl">
                  <p className="text-slate-400 leading-relaxed text-lg whitespace-pre-line font-light">
                    {project.description || "Detailed project philosophy is being finalized by the developer. Please reach out to our concierge for a private briefing."}
                  </p>
                </div>
              </section>

              {/* Configurations Section */}
              {project.configurations?.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <LayoutGrid className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Asset Portfolio</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {project.configurations.map((c, i) => (
                      <div key={i} className="group bg-white/5 border border-white/10 rounded-[2rem] p-8 flex justify-between items-center hover:bg-white/[0.08] transition-all duration-300 shadow-xl hover:border-indigo-500/20">
                        <div>
                          <div className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{c.type}</div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mt-2">
                             {c.area?.toLocaleString("en-IN")} sq.ft Super Area
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-400 tracking-tighter leading-none">₹{(c.price / 100000)?.toFixed(1)}L <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mt-1">Starting</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Amenities Section */}
              {project.amenities?.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Signature Amenities</h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {project.amenities.map((a) => (
                      <span key={a} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-black text-[11px] uppercase tracking-widest hover:border-emerald-500/30 transition-all cursor-default backdrop-blur-2xl shadow-lg">
                        {a}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-12 self-start pt-4">
            
            {/* Lead Form */}
            <div className="relative shadow-2xl shadow-indigo-500/10">
              <ProjectInterestForm project={project} />
            </div>

            {/* Builder Quick Card */}
            {builder && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white border border-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {builder.logo ? (
                      <Image src={builder.logo} alt={builder.companyName} width={80} height={80} className="object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-white truncate tracking-tight">{builder.companyName}</h3>
                      {builder.isVerified && <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
                    </div>
                    <div className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest inline-block">
                      Premier Developer
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 italic mb-8 line-clamp-3 leading-relaxed font-light">
                  "{builder.tagline || "Redefining the standards of modern living through innovation."}"
                </p>

                <Link 
                  href={`/builders/${builder.slug}`} 
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group"
                >
                  Portfolio Explorer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}

            {/* RERA/Legal Footer Card */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-indigo-500/5 to-purple-500/10 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance Dossier
              </h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">License ID</span>
                  <span className="text-white font-black tracking-tight">{project.reraNumber || "Classified"}</span>
                </div>
                <div className="h-[1px] bg-white/5 w-full" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Audit Status</span>
                  <span className={`text-xs font-black uppercase tracking-widest ${project.isReraVerified ? "text-emerald-400" : "text-indigo-400"}`}>
                    {project.isReraVerified ? "Certified ✓" : "Verification in progress"}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-[9px] text-slate-700 px-8 text-center leading-relaxed font-medium uppercase tracking-tighter">
              All architectural renderings and specifications are subject to final audit by the respective regulatory authorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
