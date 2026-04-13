'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Calendar, Check, X } from 'lucide-react';

export default function ReceivedEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/enquiries?type=received')
      .then(r => r.json())
      .then(d => { setEnquiries(d.enquiries || []); setLoading(false); });
  }, []);

  async function sendReply(id) {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'responded', ownerResponse: replyText }),
    });
    if (res.ok) {
      const { enquiry } = await res.json();
      setEnquiries(prev => prev.map(e => e._id === id ? enquiry : e));
      setActiveId(null);
      setReplyText('');
    }
    setSubmitting(false);
  }

  async function updateVisit(id, visitStatus) {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitStatus }),
    });
    if (res.ok) {
      const { enquiry } = await res.json();
      setEnquiries(prev => prev.map(e => e._id === id ? enquiry : e));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Received Enquiries</h1>
        <p className="text-sm text-slate-400 mt-1">{enquiries.length} enquir{enquiries.length !== 1 ? 'ies' : 'y'}</p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-3xl p-16 text-center">
          <MessageSquare size={44} className="text-gray-300 mx-auto mb-3" />
          <p className="text-slate-400">No enquiries yet</p>
          <p className="text-sm text-slate-500 text-[13px] font-light mt-1">Buyer enquiries on your listings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <div
              key={e._id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${!e.isRead ? 'border-blue-300' : 'border-white/10'
                }`}
            >
              <div className="p-5">
                {!e.isRead && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 transition-colors font-semibold mb-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]" /> New
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    {e.name?.[0]?.toUpperCase() || '?'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-white tracking-tight">{e.name}</p>
                        <p className="text-sm text-slate-500 text-[13px] font-light truncate mt-0.5">{e.property?.title || 'Property'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${e.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            e.status === 'responded' ? 'bg-green-100  text-green-700' :
                              'bg-white/5  text-slate-400'
                          }`}>
                          {e.status}
                        </span>
                        {e.enquiryType === 'visit' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                            Visit Request
                          </span>
                        )}
                      </div>
                    </div>

                    {e.message && (
                      <p className="text-sm text-slate-300 bg-white/5 rounded-2xl border border-white/5 shadow-sm p-3 mt-3">{e.message}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                        <Phone size={13} /> {e.phone}
                      </a>
                      <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                        <Mail size={13} /> {e.email}
                      </a>
                      {e.visitDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          {new Date(e.visitDate).toLocaleDateString('en-IN')}
                          {e.visitTime && ` · ${e.visitTime}`}
                        </span>
                      )}
                    </div>

                    {/* Visit confirmation */}
                    {e.enquiryType === 'visit' && e.visitStatus === 'requested' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => updateVisit(e._id, 'confirmed')}
                          className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-4 py-1.5 rounded-xl hover:bg-green-700 transition-colors"
                        >
                          <Check size={13} /> Confirm Visit
                        </button>
                        <button
                          onClick={() => updateVisit(e._id, 'cancelled')}
                          className="flex items-center gap-1.5 text-sm bg-white/5 text-gray-700 px-4 py-1.5 rounded-xl hover:bg-[#0b1120]/50 border border-white/5 shadow-inner transition-colors"
                        >
                          <X size={13} /> Decline
                        </button>
                      </div>
                    )}

                    {e.visitStatus && e.visitStatus !== 'requested' && (
                      <p className={`text-xs mt-2 font-semibold ${e.visitStatus === 'confirmed' ? 'text-green-600' :
                          e.visitStatus === 'cancelled' ? 'text-red-500' : 'text-indigo-400 transition-colors'
                        }`}>
                        Visit {e.visitStatus}
                      </p>
                    )}

                    {/* Reply section */}
                    {e.status !== 'closed' && (
                      <div className="mt-4">
                        {activeId === e._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={replyText}
                              onChange={ev => setReplyText(ev.target.value)}
                              placeholder="Write your response…"
                              rows={3}
                              className="w-full border border-white/10 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendReply(e._id)}
                                disabled={submitting}
                                className="text-sm bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] text-white px-4 py-1.5 rounded-xl hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-colors disabled:opacity-60"
                              >
                                {submitting ? 'Sending…' : 'Send Reply'}
                              </button>
                              <button
                                onClick={() => { setActiveId(null); setReplyText(''); }}
                                className="text-sm text-slate-500 text-[13px] font-light hover:text-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveId(e._id); setReplyText(e.ownerResponse || ''); }}
                            className="text-sm text-indigo-400 transition-colors hover:underline"
                          >
                            {e.ownerResponse ? 'Edit reply' : '+ Reply'}
                          </button>
                        )}

                        {e.ownerResponse && activeId !== e._id && (
                          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-xs text-blue-500 font-semibold mb-1">Your reply:</p>
                            <p className="text-sm text-gray-700">{e.ownerResponse}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}