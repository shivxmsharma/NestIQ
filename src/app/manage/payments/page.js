'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { IndianRupee, Calendar, CheckCircle2, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import { format } from 'date-fns';

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TenantPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  useEffect(() => {
    async function load() {
      if (!session) return;
      try {
        // Force fetching for the logged-in user explicitly treating them as tenant
        const res = await fetch('/api/payments/history?role=tenant');
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (error) {
        console.error("Error loading payments:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  const printReceipt = (payment) => {
    const printWindow = window.open('', '', 'height=700,width=800');
    const amountInRupees = ((payment.amount || 0) / 100).toLocaleString("en-IN");
    const monthStr = `${MONTHS[payment.rentMonth]} ${payment.rentYear}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Rent Receipt - ${monthStr}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #0f172a; font-size: 28px; }
            .header p { color: #64748b; margin: 5px 0 0 0; }
            .details { display: table; width: 100%; border-spacing: 0 15px; margin-bottom: 40px; }
            .row { display: table-row; }
            .label { display: table-cell; font-weight: 600; color: #475569; width: 150px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { display: table-cell; font-size: 16px; color: #0f172a; font-weight: 500; }
            .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 40px; }
            .amount-label { font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 1px; }
            .amount-value { font-size: 36px; font-weight: bold; color: #10b981; margin: 10px 0 0 0; }
            .footer { text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rent Receipt</h1>
            <p>Official record of rent payment via Tenancy Hub</p>
          </div>
          <div class="amount-box">
            <div class="amount-label">Amount Paid</div>
            <div class="amount-value">₹${amountInRupees}</div>
          </div>
          <div class="details">
            <div class="row">
              <div class="label">Date:</div>
              <div class="value">${format(new Date(payment.createdAt), 'MMMM d, yyyy h:mm a')}</div>
            </div>
            <div class="row">
              <div class="label">Period:</div>
              <div class="value">${monthStr}</div>
            </div>
            <div class="row">
              <div class="label">Receipt ID:</div>
              <div class="value" style="font-family: monospace;">#${payment.razorpayPaymentId || payment._id}</div>
            </div>
            <div class="row">
              <div class="label">Tenant:</div>
              <div class="value">${payment.tenant?.name || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Status:</div>
              <div class="value" style="color: #10b981; font-weight: bold;">PAID</div>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for using NestIQ to manage your tenancy.</p>
            <p>This is a system generated receipt and does not require a signature.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  const generateHraReceipt = () => {
    const paidRents = payments.filter(p => p.status === 'paid' && p.paymentType === 'rent');
    if (paidRents.length === 0) {
      return showMessage('error', 'No paid rent found to generate HRA receipt.');
    }

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return showMessage('error', 'Popup blocked. Please allow popups.');

    // Calculate total rent
    const totalAmount = paidRents.reduce((acc, p) => acc + (p.amount || 0), 0) / 100;

    // Fallback names
    const landlordName = paidRents[0].landlord?.name || '______________________';
    const tenantName = paidRents[0].tenant?.name || session?.user?.name || '______________________';
    const propertyTitle = paidRents[0].property?.title || 'the mentioned property';

    // Sort logically to find the duration
    const sorted = [...paidRents].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstMonth = `${MONTHS[sorted[0].rentMonth]} ${sorted[0].rentYear}`;
    const lastMonth = `${MONTHS[sorted[sorted.length - 1].rentMonth]} ${sorted[sorted.length - 1].rentYear}`;
    const duration = firstMonth === lastMonth ? firstMonth : `${firstMonth} to ${lastMonth}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>HRA Rent Receipt</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px 60px; color: #222; line-height: 1.8; font-size: 12pt; }
            h1 { text-align: center; text-decoration: underline; margin-bottom: 40px; font-size: 20pt; }
            .receipt-box { border: 2px solid #333; padding: 40px; margin-bottom: 30px; position: relative; }
            .line-text { margin-bottom: 25px; text-align: justify; }
            .strong { font-weight: bold; border-bottom: 1px dotted #000; padding: 0 5px; }
            .details-block { margin-top: 40px; line-height: 2; }
            .signature { margin-top: 80px; text-align: right; }
            .footer-note { text-align: center; margin-top: 50px; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(0,0,0,0.03); z-index: -1; }
          </style>
        </head>
        <body>
          <div class="watermark">NESTIQ HRA</div>
          <div class="receipt-box">
            <h1>RENT RECEIPT (For HRA Exemption)</h1>
            <div class="line-text">
              Received sum of <span class="strong">Rs. ${totalAmount.toLocaleString('en-IN')}/-</span> 
              (${Number(totalAmount).toFixed(2)}) from <span class="strong">${tenantName}</span> 
              towards the rent of residential property located at <span class="strong">${propertyTitle}</span> 
              for the period spanning from <span class="strong">${duration}</span>.
            </div>
            
            <div class="details-block">
              <strong>Name of Landlord:</strong> ${landlordName}<br/>
              <strong>PAN No. of Landlord:</strong> ______________________ <i style="color:#666; font-size: 10pt;">(Mandatory if annual rent exceeds ₹1,00,000)</i><br/>
              <strong>Date of Printing:</strong> ${format(new Date(), 'dd/MM/yyyy')}
            </div>

            <div class="signature">
              ___________________________<br/>
              <strong>Signature of Landlord</strong>
            </div>
          </div>
          
          <div class="footer-note">
            This consolidate statement was generated electronically by the NestIQ Tenancy Hub. 
            All payments logged herein have been verified through our digital gateway.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-end">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <IndianRupee className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Rent Details</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              View your payment history, track past rents, and download verified digital receipts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center sm:text-left">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Paid</div>
              <div className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
                {((payments.reduce((acc, p) => p.status === 'paid' ? acc + (p.amount || 0) : acc, 0)) / 100).toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={generateHraReceipt}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              HRA Receipt
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm font-bold border transition-all ${message.type === 'error'
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
          <div className="flex items-center gap-3">
            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {message.text}
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Payment History</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 font-medium">Syncing transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <IndianRupee className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No History Found</h3>
            <p className="text-slate-400 max-w-sm">
              We couldn&apos;t find any rental payments tied to your account.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {payments.map(payment => {
              const amount = ((payment.amount || 0) / 100).toLocaleString('en-IN');
              const isCompleted = payment.status === 'paid';

              return (
                <div key={payment._id} className="p-6 hover:bg-white/2 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'
                      }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-orange-400" />
                      )}
                    </div>

                    <div>
                      <div className="text-white font-bold text-lg mb-1 tracking-tight">
                        {MONTHS[payment.rentMonth]} {payment.rentYear} Rent
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {format(new Date(payment.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        {payment.razorpayPaymentId && (
                          <span className="text-slate-500 font-mono text-xs px-2 py-0.5 rounded bg-white/5">
                            ID: {payment.razorpayPaymentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                      <div className="flex items-center justify-end gap-1 text-xl font-bold text-white mb-1">
                        <IndianRupee className="w-5 h-5 text-emerald-400" />
                        {amount}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                        {payment.status}
                      </span>
                    </div>

                    {
                      isCompleted && (
                        <button
                          onClick={() => printReceipt(payment)}
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all shadow-sm shrink-0"
                          title="Download Receipt"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      )
                    }
                  </div>

                </div>
              );
            })}
          </div>
        )
        }
      </div >
    </div >
  );
}
