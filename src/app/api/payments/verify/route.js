import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Payment from "../../../../lib/models/Payment";
import Property from "../../../../lib/models/Property";
import User from "../../../../lib/models/User";
import Lease from "../../../../lib/models/Lease";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_123");

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature)
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    await connectDB();

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
      },
      { new: true }
    ).populate("property tenant landlord");

    if (!payment) return NextResponse.json({ error: "Payment record not found" }, { status: 404 });

    if (payment.paymentType === "security_deposit") {
      const lease = await Lease.findById(payment.lease);
      if (lease) {
        lease.status = "active";
        lease.tenantSignedAt = new Date();
        await lease.save();
      }
    }

    try {
      if (process.env.RESEND_API_KEY) {
        // Send receipt email to tenant
        const monthName = new Date(payment.rentYear, payment.rentMonth - 1).toLocaleString("en-IN", { month: "long" });
        const amountInRupees = (payment.amount / 100).toLocaleString("en-IN");

        await resend.emails.send({
          from: "NestIQ <noreply@nestiq.in>",
          to: payment.tenant.email,
          subject: `✅ Rent Payment Confirmed — ${monthName} ${payment.rentYear}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
              <h2 style="color:#10b981">Rent Payment Successful 🏠</h2>
              <p>Hi ${payment.tenant.name},</p>
              <p>Your rent payment for <strong>${monthName} ${payment.rentYear}</strong> has been received.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;background:#f3f4f6;font-weight:600">Amount Paid</td>
                    <td style="padding:8px">₹${amountInRupees}</td></tr>
                <tr><td style="padding:8px;background:#f3f4f6;font-weight:600">Payment ID</td>
                    <td style="padding:8px">${razorpayPaymentId}</td></tr>
                <tr><td style="padding:8px;background:#f3f4f6;font-weight:600">Landlord</td>
                    <td style="padding:8px">${payment.landlord.name}</td></tr>
              </table>
              <p style="color:#6b7280;font-size:13px">Please keep this email as your payment receipt.</p>
              <p style="color:#6b7280;font-size:13px">— Team NestIQ</p>
            </div>
          `,
        });

        // Notify landlord
        await resend.emails.send({
          from: "NestIQ <noreply@nestiq.in>",
          to: payment.landlord.email,
          subject: `💰 Rent Received — ${monthName} ${payment.rentYear}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
              <h2 style="color:#3b82f6">Rent Payment Received</h2>
              <p>Hi ${payment.landlord.name},</p>
              <p>${payment.tenant.name} has paid rent of <strong>₹${amountInRupees}</strong> for ${monthName} ${payment.rentYear}.</p>
              <p style="color:#6b7280;font-size:13px">— Team NestIQ</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send receipt emails:", emailError);
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error during verification" }, { status: 500 });
  }
}