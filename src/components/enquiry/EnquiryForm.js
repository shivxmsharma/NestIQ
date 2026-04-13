'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Calendar, Send, Check } from 'lucide-react';
import Link from 'next/link';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
];

export default function EnquiryForm({ propertyId }) {
  const { data: session } = useSession();
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', visitDate: '', visitTime: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || session.user.name || '',
        email: prev.email || session.user.email || '',
      }));
    }
  }, [session]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError('Name, email and phone are required.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId,
        name: form.name || session?.user?.name || '',
        email: form.email || session?.user?.email || '',
        phone: form.phone,
        message: form.message,
        enquiryType: tab,
        visitDate: tab === 'visit' ? form.visitDate : undefined,
        visitTime: tab === 'visit' ? form.visitTime : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || 'Something went wrong. Please try again.');
    }
  }

  if (!session) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-4xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 text-center">
        <MessageSquare size={30} className="text-indigo-400 mx-auto mb-3" />
        <h3 className="font-semibold text-white mb-1">Contact Owner</h3>
        <p className="text-sm text-slate-400 font-light mb-4">Sign in to enquire about this property</p>
        <Link
          href={`/auth/login?callbackUrl=/properties/${propertyId}`}
          className="block w-full bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-500 hover:-translate-y-0.5 transition-colors"
        >
          Sign In to Enquire
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-4xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-6 text-center">
        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check size={26} className="text-emerald-400" />
        </div>
        <h3 className="font-semibold text-white mb-1">Enquiry Sent!</h3>
        <p className="text-sm text-slate-400 font-light mb-4">The owner will get back to you soon.</p>
        <Link href="/dashboard/my-enquiries" className="text-sm text-indigo-400 font-medium hover:underline">
          View My Enquiries →
        </Link>
      </div>
    );
  }

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-4xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] p-5">
      <h3 className="font-semibold text-white mb-4">Contact Owner</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[#0b1120]/50 p-1.5 rounded-2xl border border-white/5">
        {[
          { id: 'general', label: 'Enquire', icon: MessageSquare },
          { id: 'visit', label: 'Schedule Visit', icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${tab === id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name" value={form.name} onChange={handleChange}
          placeholder="Your name *"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
          required
        />
        <input
          name="email" type="email" value={form.email} onChange={handleChange}
          placeholder="Email address *"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
          required
        />
        <input
          name="phone" type="tel" value={form.phone} onChange={handleChange}
          placeholder="Phone number *"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
          required
        />
        <textarea
          name="message" value={form.message} onChange={handleChange}
          placeholder={tab === 'visit' ? 'Any special requirements?' : 'Your message (optional)'}
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />

        {tab === 'visit' && (
          <>
            <input
              name="visitDate" type="date" value={form.visitDate} onChange={handleChange}
              min={todayISO}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
              required
            />
            <select
              name="visitTime" value={form.visitTime} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
              required
            >
              <option value="" className="bg-[#0b1120] text-slate-400">Select preferred time *</option>
              {TIME_SLOTS.map(t => <option key={t} value={t} className="bg-[#0b1120]">{t}</option>)}
            </select>
          </>
        )}

        {error && (
          <p className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm p-3 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-500 hover:-translate-y-0.5 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Send size={14} />
          }
          {loading ? 'Sending…' : tab === 'visit' ? 'Request Visit' : 'Send Enquiry'}
        </button>
      </form>
    </div>
  );
}
