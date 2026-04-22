"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle, Loader2, IndianRupee, MessageSquare, Send, Sparkles } from "lucide-react";

export default function ProjectInterestForm({ project }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasInterest, setHasInterest] = useState(false);
  const [form, setForm] = useState({ interestedConfig: "", budget: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Check if user already registered interest
  useEffect(() => {
    if (!session) return;
    fetch(`/api/builders/projects/${project.slug}/interest`)
      .then((r) => r.json())
      .then((d) => { 
        if (d.hasInterest) { 
          setHasInterest(true); 
          setSuccess(true); 
        } 
      })
      .catch(console.error);
  }, [session, project.slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) { 
      router.push(`/auth/login?callbackUrl=/builders/projects/${project.slug}`); 
      return; 
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/builders/projects/${project.slug}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...form, 
          budget: form.budget ? parseInt(form.budget) : undefined 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register interest");
      setSuccess(true);
      setHasInterest(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 text-center backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Interest Registered!</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Your details have been shared with <span className="text-white font-bold">{project.builder?.companyName}</span>. 
          A relationship manager will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
      {/* Decorative gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Register Interest</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {project.configurations?.length > 0 && (
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
              Preferred Config
            </label>
            <div className="relative">
              <select 
                value={form.interestedConfig} 
                onChange={(e) => setForm({ ...form, interestedConfig: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0b1120]">Any Configuration</option>
                {project.configurations.map((c) => (
                  <option key={c.type} value={c.type} className="bg-[#0b1120]">
                    {c.type} — ₹{(c.price / 100000)?.toFixed(1)}L
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500">
                <Send size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
            Your Budget <IndianRupee size={10} />
          </label>
          <input 
            type="number" 
            placeholder="e.g. 75,00,000" 
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center justify-between">
            Notes <MessageSquare size={10} />
          </label>
          <textarea 
            value={form.message} 
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us about your requirements..." 
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none" 
          />
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 uppercase tracking-widest"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get Pricing Brochure
            </>
          )}
        </button>

        {!session && (
          <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-tighter">
            One-tap login required to verify contact details
          </p>
        )}
      </form>
    </div>
  );
}
