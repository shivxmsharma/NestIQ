"use client";
import { useState, useEffect } from "react";
import { 
  Clock, Calendar, Trash2, ArrowLeft, 
  Building2, Camera, MapPin, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ConstructionUpdateForm from "../../../../../../components/builders/ConstructionUpdateForm";

export default function ProjectUpdatesPage({ params }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/manage/builder/projects/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, []);

  const deleteUpdate = async (updateIdx) => {
    if (!confirm("Are you sure you want to remove this update?")) return;
    try {
      const updatedList = project.constructionUpdates.filter((_, i) => i !== updateIdx);
      const res = await fetch(`/api/manage/builder/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constructionUpdates: updatedList })
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Update removed");
      setProject({ ...project, constructionUpdates: updatedList });
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500 uppercase font-black text-xs">Opening Timeline...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      
      {/* Header */}
      <div className="space-y-4">
        <Link href="/manage/builder/projects" className="flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors text-xs font-black uppercase tracking-widest">
          <ChevronLeft size={14} /> Back to Inventory
        </Link>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
            {project?.coverImage ? <img src={project.coverImage} className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-4 text-slate-700" />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{project?.title}</h1>
            <p className="text-slate-400 flex items-center gap-2 text-sm font-bold uppercase tracking-wider mt-1">
               <Clock size={14} className="text-amber-400" /> Construction Timeline
            </p>
          </div>
        </div>
      </div>

      {/* Post Update Form */}
      <ConstructionUpdateForm projectId={project?._id} onUpdateAdded={fetchProject} />

      {/* Existing Updates List */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-white px-2">Project History</h2>
        
        {project?.constructionUpdates?.length === 0 ? (
          <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem] text-slate-500">
            <Camera className="mx-auto w-10 h-10 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No updates posted yet</p>
          </div>
        ) : (
          <div className="relative pl-8 border-l-2 border-white/5 space-y-12 ml-4">
            {project.constructionUpdates.map((u, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[2.55rem] w-5 h-5 rounded-full bg-white/10 border-4 border-[#0b1120] group-hover:bg-amber-500 transition-all shadow-lg" />
                
                <div className="flex flex-col md:flex-row gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl relative group-hover:bg-white/[0.08] transition-all">
                  {u.image && (
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-black/20 shrink-0 border border-white/10">
                      <img src={u.image} alt={u.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        {new Date(u.date).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}
                      </span>
                      <button 
                        onClick={() => deleteUpdate(i)}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-500"
                        title="Remove Update"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{u.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{u.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
