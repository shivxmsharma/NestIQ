"use client";
import { useState } from "react";
import { 
  Plus, Calendar, Image as ImageIcon, 
  Loader2, Save, X, Trash2, Clock
} from "lucide-react";
import toast from "react-hot-toast";

export default function ConstructionUpdateForm({ projectId, onUpdateAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    image: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Fetch current project to get existing updates
      const resProj = await fetch(`/api/manage/builder/projects/${projectId}`);
      const dataProj = await resProj.json();
      if (!resProj.ok) throw new Error(dataProj.error);

      const updatedList = [form, ...(dataProj.project.constructionUpdates || [])];

      const res = await fetch(`/api/manage/builder/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constructionUpdates: updatedList })
      });

      if (!res.ok) throw new Error("Failed to post update");
      
      toast.success("Construction update posted!");
      setForm({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        image: "",
      });
      setShowForm(false);
      if (onUpdateAdded) onUpdateAdded();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="w-full py-6 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 font-black uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-500 transition-all flex items-center justify-center gap-3 bg-white/5"
      >
        <Plus size={20} /> Post New Construction Update
      </button>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Clock size={80} />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-white px-2">New Progress Update</h3>
        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-500">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Update Title*</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Ground Floor Slab Completed"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Date*</label>
            <input 
              type="date" 
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Detailed Description</label>
          <textarea 
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Update Image URL</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="https://..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white"
            />
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-700 shrink-0">
              {form.image ? <img src={form.image} className="w-full h-full object-cover rounded-xl" /> : <ImageIcon />}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-white/5 mt-8">
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            className="px-8 py-4 text-slate-500 font-bold hover:text-white transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-10 py-4 bg-amber-500 hover:bg-orange-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 uppercase tracking-widest flex items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            Post Update
          </button>
        </div>
      </form>
    </div>
  );
}
