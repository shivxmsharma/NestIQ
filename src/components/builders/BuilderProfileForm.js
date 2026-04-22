"use client";
import { useState } from "react";
import { 
  Building2, Globe, MapPin, BadgeCheck, 
  Upload, Loader2, Save, AlignLeft,
  Calendar, Phone, Mail, Award
} from "lucide-react";
import toast from "react-hot-toast";

export default function BuilderProfileForm({ initialData }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialData || {
    companyName: "",
    tagline: "",
    description: "",
    logo: "",
    coverImage: "",
    establishedYear: "",
    headquarters: {
      address: "",
      city: "",
      state: "",
    },
    website: "",
    contact: {
      email: "",
      phone: "",
    },
    reraId: "",
  });

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setForm(prev => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/manage/builder/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      
      {/* Branding Section */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <Award size={120} />
        </div>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Building2 />
          </div>
          <h2 className="text-2xl font-black text-white">Brand Identity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Company Name</label>
            <input 
              type="text" 
              required
              value={form.companyName} 
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Tagline</label>
            <input 
              type="text" 
              placeholder="e.g. Building Dreams into Reality"
              value={form.tagline} 
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Description</label>
            <textarea 
              rows={5}
              value={form.description} 
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white resize-none focus:outline-none" 
            />
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Company Logo URL</label>
            <div className="flex gap-4 items-center">
              <input 
                type="text" 
                value={form.logo} 
                onChange={(e) => handleChange('logo', e.target.value)}
                className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm" 
              />
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                {form.logo ? <img src={form.logo} className="w-full h-full object-cover" /> : <Upload className="text-slate-700" />}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest px-1">Cover Image URL</label>
            <input 
              type="text" 
              value={form.coverImage} 
              onChange={(e) => handleChange('coverImage', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm" 
            />
          </div>
        </div>
      </div>

      {/* Corporate Info Section */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Globe size={20} />
          </div>
          <h2 className="text-2xl font-black text-white">Corporate Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Established Year</label>
            <input 
              type="number" 
              value={form.establishedYear} 
              onChange={(e) => handleChange('establishedYear', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">RERA Number</label>
            <input 
              type="text" 
              value={form.reraId} 
              onChange={(e) => handleChange('reraId', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white uppercase" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Official Email</label>
            <input 
              type="email" 
              value={form.contact.email} 
              onChange={(e) => handleChange('contact.email', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Corporate Phone</label>
            <input 
              type="text" 
              value={form.contact.phone} 
              onChange={(e) => handleChange('contact.phone', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Headquarters City</label>
            <input 
              type="text" 
              value={form.headquarters.city} 
              onChange={(e) => handleChange('headquarters.city', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={submitting}
          className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest flex items-center gap-3 min-w-[200px] justify-center"
        >
          {submitting ? <Loader2 className="animate-spin" /> : <Save />}
          Save Profile
        </button>
      </div>
    </form>
  );
}
