"use client";
import { useState } from "react";
import { 
  Building2, MapPin, IndianRupee, Layers, 
  Info, CheckCircle2, Plus, Trash2, 
  Upload, Loader2, Calendar, FileText,
  LayoutGrid
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AMENITIES_OPTIONS = [
  "Clubhouse", "Swimming Pool", "Gymnasium", "24/7 Security", 
  "Power Backup", "Parking", "Elevator", "Garden", 
  "Children's Play Area", "Indoor Games", "Party Hall", 
  "Jogging Track", "CCTV Surveillance", "Intercom",
  "Smart Home Features", "EV Charging", "Rainwater Harvesting"
];

const PROJECT_TYPES = ["Residential", "Commercial", "Mixed-Use", "Villa", "Township", "Plots"];
const PROJECT_STATUSES = ["Upcoming", "Under Construction", "Ready to Move", "Completed"];

export default function ProjectForm({ initialData = null, mode = "create" }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialData || {
    title: "",
    description: "",
    projectType: "Residential",
    status: "Upcoming",
    location: {
      street: "",
      locality: "",
      city: "Chandigarh",
      state: "Punjab",
      pincode: "",
      coordinates: { type: "Point", coordinates: [76.7794, 30.7333] }
    },
    priceRange: { min: 0, max: 0 },
    configurations: [{ type: "", area: 0, price: 0, availableUnits: 0 }],
    amenities: [],
    highlights: [""],
    totalUnits: 0,
    availableUnits: 0,
    reraNumber: "",
    isReraVerified: false,
    coverImage: "",
    launchDate: "",
    possessionDate: "",
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

  const toggleAmenity = (name) => {
    const current = [...form.amenities];
    if (current.includes(name)) {
      setForm({ ...form, amenities: current.filter(a => a !== name) });
    } else {
      setForm({ ...form, amenities: [...current, name] });
    }
  };

  const handleArrayChange = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = value;
    setForm({ ...form, [field]: arr });
  };

  const handleObjectArrayChange = (field, index, subfield, value) => {
    const arr = [...form[field]];
    arr[index] = { ...arr[index], [subfield]: value };
    setForm({ ...form, [field]: arr });
  };

  const addArrayItem = (field, defaultValue) => {
    setForm({ ...form, [field]: [...form[field], defaultValue] });
  };

  const removeArrayItem = (field, index) => {
    if (form[field].length <= 1 && field === "configurations") return;
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.projectType) {
      toast.error("Title and project type are required");
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/manage/builder/projects" : `/api/manage/builder/projects/${initialData._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      toast.success(mode === "create" ? "Project launched successfully!" : "Project updated successfully!");
      router.push("/manage/builder/projects");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      
      {/* Section 1: Core Identities */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Info size={120} />
        </div>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Building2 className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Basic Information</h2>
            <p className="text-slate-500 text-sm">Define your project's brand and current development status.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Project Title*</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Skyline Heights Phase II"
              value={form.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-bold text-lg" 
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Project Type*</label>
            <select 
              value={form.projectType} 
              onChange={(e) => handleChange('projectType', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none"
            >
              {PROJECT_TYPES.map(t => <option key={t} value={t} className="bg-[#0b1120]">{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Current Status*</label>
            <select 
              value={form.status} 
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all appearance-none"
            >
              {PROJECT_STATUSES.map(s => <option key={s} value={s} className="bg-[#0b1120]">{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Description</label>
            <textarea 
              rows={5}
              placeholder="Tell buyers what makes this project special..."
              value={form.description} 
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none" 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Location Map */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <MapPin className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Geographic Location</h2>
            <p className="text-slate-500 text-sm">Specify the exact locality for better search ranking and map placement.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Street Address / Plot No.</label>
            <input 
              type="text" 
              value={form.location.street} 
              onChange={(e) => handleChange('location.street', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Locality / Sector*</label>
            <input 
              type="text" 
              required
              value={form.location.locality} 
              onChange={(e) => handleChange('location.locality', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">City*</label>
            <input 
              type="text" 
              required
              value={form.location.city} 
              onChange={(e) => handleChange('location.city', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Section 3: Pricing & Inventory */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Layers className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Inventory & Pricing</h2>
            <p className="text-slate-500 text-sm">Add different unit types and their respective base prices.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Starting Price (Min)*</label>
              <input 
                type="number" 
                required
                value={form.priceRange.min} 
                onChange={(e) => handleChange('priceRange.min', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-emerald-400 font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Max Price Range</label>
              <input 
                type="number" 
                value={form.priceRange.max} 
                onChange={(e) => handleChange('priceRange.max', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
              />
            </div>
          </div>

          <div className="h-[1px] bg-white/5 my-8" />

          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Units & Configurations</label>
          <div className="space-y-4">
            {form.configurations.map((config, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group/row">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase">Type</label>
                    <input 
                      placeholder="e.g. 3 BHK"
                      value={config.type}
                      onChange={(e) => handleObjectArrayChange('configurations', idx, 'type', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase">Area (sq.ft)</label>
                    <input 
                      type="number"
                      value={config.area}
                      onChange={(e) => handleObjectArrayChange('configurations', idx, 'area', parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase">Price (₹)</label>
                    <input 
                      type="number"
                      value={config.price}
                      onChange={(e) => handleObjectArrayChange('configurations', idx, 'price', parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-2 uppercase">Units Left</label>
                    <div className="flex gap-2">
                       <input 
                        type="number"
                        value={config.availableUnits}
                        onChange={(e) => handleObjectArrayChange('configurations', idx, 'availableUnits', parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                      />
                      <button 
                        type="button"
                        onClick={() => removeArrayItem('configurations', idx)}
                        className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addArrayItem('configurations', { type: "", area: 0, price: 0, availableUnits: 0 })}
              className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 font-bold hover:border-indigo-500/40 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Another Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Details & Media */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <LayoutGrid className="text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Project Highlights</h2>
            <p className="text-slate-500 text-sm">Select amenities and upload visual media.</p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1">Available Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AMENITIES_OPTIONS.map(a => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
                    form.amenities.includes(a)
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${form.amenities.includes(a) ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">RERA Number</label>
              <input 
                type="text" 
                value={form.reraNumber} 
                onChange={(e) => handleChange('reraNumber', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white uppercase" 
              />
            </div>
            <div className="flex items-center gap-4 pt-8">
               <input 
                type="checkbox" 
                id="isReraVerified"
                checked={form.isReraVerified} 
                onChange={(e) => handleChange('isReraVerified', e.target.checked)}
                className="w-6 h-6 rounded-lg bg-white/5 border-white/10 text-emerald-500 focus:ring-0" 
              />
              <label htmlFor="isReraVerified" className="text-sm font-bold text-slate-300 cursor-pointer">Verified by RERA Authority</label>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Expected Possession Date</label>
              <input 
                type="date" 
                value={form.possessionDate ? new Date(form.possessionDate).toISOString().split('T')[0] : ""} 
                onChange={(e) => handleChange('possessionDate', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Cover Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={form.coverImage} 
                  onChange={(e) => handleChange('coverImage', e.target.value)}
                  className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white" 
                  placeholder="https://images.unsplash.com/..."
                />
                <div className="w-16 h-[60px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                  {form.coverImage ? <img src={form.coverImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Upload className="text-slate-700" /></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Submit Footer */}
      <div className="sticky bottom-8 left-0 right-0 z-50 px-4 md:px-0">
        <div className="bg-[#111827]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-2xl shadow-black">
          <div className="hidden md:block pl-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Current Action</p>
            <p className="text-white font-black">{mode === "create" ? "Direct Launch to Search Index" : "Update Existing Listing"}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 md:flex-none px-12 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest flex items-center justify-center gap-3 min-w-[240px]"
            >
              {submitting ? <><Loader2 className="animate-spin" /> Syncing...</> : <><Plus /> {mode === "create" ? "Confirm & Launch" : "Save Changes"}</>}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
