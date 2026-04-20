/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FileText, FileCheck, FileX, Download, Calendar, IndianRupee, Home, Clock, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Script from 'next/script';

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [renewModal, setRenewModal] = useState({ show: false, lease: null });
  const [renewForm, setRenewForm] = useState({ newStartDate: '', newEndDate: '', newRentAmount: '' });
  const [terminateModal, setTerminateModal] = useState({ show: false, lease: null });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      const res = await fetch('/api/manage/leases');
      const data = await res.json();
      if (data.success) {
        setLeases(data.leases);
      }
    } catch (error) {
      console.error(error);
      showMessage('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSubmit = async (refundMethod) => {
    if (!terminateModal.lease) return;

    try {
      const res = await fetch(`/api/manage/leases/${terminateModal.lease._id}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundMethod })
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `Lease terminated. ${refundMethod !== 'none' ? 'Deposit refunded!' : ''}`);
        setTerminateModal({ show: false, lease: null });
        fetchLeases();
      } else {
        showMessage('error', data.error || "Failed to terminate lease");
      }
    } catch (e) {
      showMessage('error', "An error occurred while terminating");
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    if (!renewModal.lease) return;

    try {
      const res = await fetch(`/api/manage/leases/${renewModal.lease._id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewForm)
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', "Lease renewed! A new pending agreement was created.");
        setRenewModal({ show: false, lease: null });
        fetchLeases();
      } else {
        showMessage('error', data.error || "Failed to renew lease");
      }
    } catch (err) {
      showMessage('error', "A network error occurred while renewing");
    }
  };

  const generateDigitalLease = (lease) => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return showMessage('error', 'Popup blocked. Please allow popups for this site.');

    const rentStr = lease.rentAmount?.toLocaleString('en-IN') || "0";
    const depositStr = lease.securityDeposit?.toLocaleString('en-IN') || "0";

    printWindow.document.write(`
      <html>
        <head>
          <title>Digital Lease Agreement - ${lease.property?.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px 60px; color: #222; line-height: 1.8; font-size: 11pt; }
            h1 { text-align: center; color: #111; border-bottom: 2px solid #ccc; padding-bottom: 10px; font-size: 24pt; letter-spacing: 1px; }
            .subtitle { text-align: center; font-style: italic; color: #555; margin-bottom: 40px; }
            h2 { font-size: 14pt; margin-top: 30px; text-decoration: underline; }
            .section { margin-bottom: 25px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table td { border: 1px solid #ddd; padding: 10px; }
            .details-table td:first-child { font-weight: bold; width: 40%; background: #f9f9f9; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
            .sign-box { width: 40%; text-align: center; border-top: 1px solid #111; padding-top: 10px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); z-index: -1; }
          </style>
        </head>
        <body>
          <div class="watermark">NESTIQ</div>
          <h1>RESIDENTIAL RENT AGREEMENT</h1>
          <div class="subtitle">Generated electronically on ${format(new Date(), "MMMM d, yyyy")}</div>

          <div class="section">
            <p>This Rent Agreement is made and executed on this <strong>${format(new Date(lease.startDate), "do 'day of' MMMM, yyyy")}</strong> by and between:</p>
            <table class="details-table">
              <tr><td>Landlord</td><td>${lease.landlord?.name || '________________'}</td></tr>
              <tr><td>Tenant</td><td>${lease.tenant?.name || '________________'}</td></tr>
              <tr><td>Property Address</td><td>${lease.property?.address?.street || ''}, ${lease.property?.address?.locality || ''}, ${lease.property?.address?.city || ''}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>1. Term of Tenancy</h2>
            <p>The tenancy shall commence on <strong>${format(new Date(lease.startDate), "MMMM d, yyyy")}</strong> and shall continue until <strong>${format(new Date(lease.endDate), "MMMM d, yyyy")}</strong>, unless terminated earlier in accordance with the terms herein.</p>
          </div>

          <div class="section">
            <h2>2. Rent & Security Deposit</h2>
            <table class="details-table">
              <tr><td>Monthly Rent</td><td>₹ ${rentStr}</td></tr>
              <tr><td>Security Deposit</td><td>₹ ${depositStr}</td></tr>
              <tr><td>Payment Due Date</td><td>1st to 5th of every month</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>3. Terms & Conditions</h2>
            <ul>
              <li>The Tenant shall use the Premises solely for residential purposes.</li>
              <li>The Tenant shall not sublet or assign the Premises to any third party.</li>
              <li>Electricity, water, and internet bills shall be borne by the Tenant.</li>
              <li>The Security Deposit shall be refunded at the end of the tenancy after deducting outstanding dues and repair costs, if any.</li>
            </ul>
          </div>

          <div class="signatures">
            <div class="sign-box">
              ${lease.landlordSignedAt
        ? `<p style="color:green; font-weight:bold;">Digitally Signed<br/>${format(new Date(lease.landlordSignedAt), "MMM d, yyyy h:mm a")}</p>`
        : `<p style="color:red;">Pending Signature</p>`}
              <strong>${lease.landlord?.name || 'Landlord'}</strong>
            </div>
            <div class="sign-box">
              ${lease.tenantSignedAt
        ? `<p style="color:green; font-weight:bold;">Digitally Signed<br/>${format(new Date(lease.tenantSignedAt), "MMM d, yyyy h:mm a")}</p>`
        : `<p style="color:red;">Pending Signature & Payment</p>`}
              <strong>${lease.tenant?.name || 'Tenant'}</strong>
            </div>
          </div>
          
          <div style="margin-top: 50px; text-align: center; font-size: 9pt; color: #888;">
            <p>This is a system-generated document created via the Tenancy Hub platform. Document ID: ${lease._id}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  const signLease = async (leaseId) => {
    try {
      const res = await fetch(`/api/manage/leases/${leaseId}/sign`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMessage('success', "Lease digitally acknowledged");
        fetchLeases();
      } else {
        showMessage('error', data.error || "Failed to sign lease");
      }
    } catch (e) {
      showMessage('error', "An error occurred");
    }
  };

  const handleAutopaySetup = async (lease) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/manage/leases/${lease._id}/autopay`, { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "NestIQ Rent AutoPay",
        description: `Monthly Auto-Debit for ${lease.property?.title || 'Property'}`,
        handler: async function (response) {
          // Razorpay returns razorpay_payment_id, razorpay_subscription_id, razorpay_signature here
          const verifyRes = await fetch("/api/manage/leases/verify-autopay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leaseId: lease._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.error) {
            showMessage('error', verifyData.error);
          } else {
            showMessage('success', "AutoPay successfully activated!");
            fetchLeases();
          }
        },
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: { color: "#10b981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        showMessage('error', "AutoPay setup failed: " + response.error.description);
      });
      rzp.open();
    } catch (e) {
      showMessage('error', e.message || "Failed to initialize AutoPay");
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = async (lease) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/manage/leases/${lease._id}/pay-deposit`, { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "NestIQ Payments",
        description: `Security Deposit for ${lease.property?.title || 'Property'}`,
        order_id: data.orderId,
        handler: async function (response) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.error) {
            showMessage('error', verifyData.error);
          } else {
            showMessage('success', "Deposit paid and Lease Activated!");
            fetchLeases();
          }
        },
        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: { color: "#10b981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        showMessage('error', "Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (e) {
      showMessage('error', e.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const isLandlord = session?.user?.role === 'seller' || session?.user?.role === 'broker';

  const filteredLeases = leases.filter(lease => {
    if (filter === 'all') return true;
    return lease.status === filter;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' };
      case 'pending':
        return { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/20' };
      case 'expired':
      case 'terminated':
        return { icon: FileX, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/20' };
      default:
        return { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/20' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Documents & Leases</h1>
              <p className="text-slate-400 mt-1">Manage your digital agreements and securely access related files.</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['all', 'active', 'pending', 'expired'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === f
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} Leases
              </button>
            ))}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm font-bold border transition-all ${message.type === 'error'
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
          <div className="flex items-center gap-3">
            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70 transition-opacity">
            <FileX className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      {/* Leases List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Loading documents...</div>
        ) : filteredLeases.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileX className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Documents Found</h3>
            <p className="text-slate-400 max-w-sm">
              {isLandlord
                ? "You haven't issued any leases yet. Head over to My Properties to generate one."
                : "You don't have any active agreements linked to your account."}
            </p>
          </div>
        ) : (
          filteredLeases.map(lease => {
            const statusConfig = getStatusConfig(lease.status);
            const StatusIcon = statusConfig.icon;
            const otherParty = isLandlord ? lease.tenant : lease.landlord;

            return (
              <div key={lease._id} className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 hover:bg-white/[0.07] transition-all relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">

                  {/* Property Thumbnail */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 relative bg-white/10 border border-white/10">
                    {lease.property?.photos?.[0]?.url || (typeof lease.property?.photos?.[0] === 'string' && lease.property?.photos?.[0]) ? (
                      <Image
                        src={lease.property.photos[0]?.url || lease.property.photos[0]}
                        alt="Property"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Home className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
                    )}
                  </div>

                  {/* Lease Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">
                        {lease.property?.title || 'Unknown Property'}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {lease.status}
                      </span>
                    </div>

                    <div className="text-sm text-slate-400 mb-4 truncate">
                      {lease.property?.address?.street ? `${lease.property.address.street}, ` : ''}
                      {lease.property?.address?.locality}
                    </div>

                    <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-8">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
                          {isLandlord ? 'Tenant' : 'Landlord'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden relative shrink-0">
                            {otherParty?.avatar ? (
                              <Image src={otherParty.avatar} alt="User" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                {otherParty?.name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-slate-300 font-medium truncate">
                            {otherParty?.name || 'Unknown User'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Duration</p>
                        <div className="flex items-center gap-1.5 text-sm text-slate-300">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {format(new Date(lease.startDate), 'MMM d, yyyy')} - {format(new Date(lease.endDate), 'MMM d, yyyy')}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Rent / Mo</p>
                        <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {lease.rentAmount?.toLocaleString('en-IN') || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-3 w-full md:w-auto md:flex-col border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                    <button
                      onClick={() => generateDigitalLease(lease)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Lease
                    </button>
                    {isLandlord && lease.status === 'pending' && !lease.landlordSignedAt && (
                      <button
                        onClick={() => signLease(lease._id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <FileCheck className="w-4 h-4" />
                        Sign Document
                      </button>
                    )}
                    {!isLandlord && lease.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (!lease.landlordSignedAt) {
                            showMessage('error', "Waiting for landlord to sign the lease first.");
                          } else {
                            handlePayDeposit(lease);
                          }
                        }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors ${lease.landlordSignedAt ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-600 opacity-50 cursor-not-allowed'}`}
                      >
                        <IndianRupee className="w-4 h-4" />
                        {lease.landlordSignedAt ? `Sign & Pay ₹${(lease.securityDeposit || 0).toLocaleString('en-IN')}` : 'Waiting on Landlord'}
                      </button>
                    )}
                    {!isLandlord && lease.status === 'active' && !lease.autoPayEnabled && (
                      <button
                        onClick={() => handleAutopaySetup(lease)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Setup AutoPay
                      </button>
                    )}
                    {!isLandlord && lease.status === 'active' && lease.autoPayEnabled && (
                      <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        AutoPay Active
                      </div>
                    )}
                    {isLandlord && lease.status === 'active' && (
                      <button
                        onClick={() => {
                          const sd = new Date(lease.endDate);
                          sd.setDate(sd.getDate() + 1); // Default to day after old lease ends
                          const ed = new Date(sd);
                          ed.setMonth(ed.getMonth() + 11);

                          setRenewForm({
                            newStartDate: sd.toISOString().split('T')[0],
                            newEndDate: ed.toISOString().split('T')[0],
                            newRentAmount: lease.rentAmount
                          });
                          setRenewModal({ show: true, lease });
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Renew
                      </button>
                    )}
                    {isLandlord && (lease.status === 'active' || lease.status === 'pending') && (
                      <button
                        onClick={() => setTerminateModal({ show: true, lease })}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-medium transition-colors"
                      >
                        <FileX className="w-4 h-4" />
                        Terminate
                      </button>
                    )}
                    {lease.documents?.length > 0 && (
                      <a
                        href={lease.documents[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Renew Modal */}
      {renewModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Renew Lease</h3>
                  <p className="text-sm text-slate-400 mt-1">Draft a new 11-month agreement</p>
                </div>
                <button
                  onClick={() => setRenewModal({ show: false, lease: null })}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRenewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">New Rent Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={renewForm.newRentAmount}
                      onChange={(e) => setRenewForm({ ...renewForm, newRentAmount: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-right">Escalation is typically 5-10%</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={renewForm.newStartDate}
                      onChange={(e) => setRenewForm({ ...renewForm, newStartDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">End Date (Max 11 Mo)</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={renewForm.newEndDate}
                      onChange={(e) => setRenewForm({ ...renewForm, newEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRenewModal({ show: false, lease: null })}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/25"
                  >
                    Draft Renewal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Modal */}
      {terminateModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-red-600"></div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Terminate Lease</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Security Deposit: <span className="font-bold text-white">₹{terminateModal.lease?.securityDeposit?.toLocaleString('en-IN') || 0}</span>
                  </p>
                </div>
                <button
                  onClick={() => setTerminateModal({ show: false, lease: null })}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-300 mb-6">
                How would you like to handle the security deposit refund for this termination?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleTerminateSubmit("razorpay")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-white mb-0.5">Refund via Razorpay</p>
                    <p className="text-xs text-slate-400">Automatically refund to the tenant&apos;s original payment method.</p>
                  </div>
                  <IndianRupee className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handleTerminateSubmit("manual")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-white mb-0.5">Manual Refund (Off-Platform)</p>
                    <p className="text-xs text-slate-400">I have paid / will pay the tenant via Cash/UPI manually.</p>
                  </div>
                  <FileCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handleTerminateSubmit("none")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/10 transition-colors group"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-white mb-0.5">No Refund / Forfeit</p>
                    <p className="text-xs text-slate-400">Deposit is forfeited or wasn&apos;t collected.</p>
                  </div>
                  <FileX className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setTerminateModal({ show: false, lease: null })}
                  className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
