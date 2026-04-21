import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Payment from "../../../../lib/models/Payment";
import Property from "../../../../lib/models/Property";
import User from "../../../../lib/models/User";
import Lease from "../../../../lib/models/Lease";
import { sendPaymentReceipts } from "../../../../lib/emailTemplates";

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
      // Send receipt emails using centralized Nodemailer logic
      const monthName = new Date(payment.rentYear, payment.rentMonth - 1).toLocaleString("en-IN", { month: "long" });
      const amountInRupees = (payment.amount / 100).toLocaleString("en-IN");

      await sendPaymentReceipts({
        payment,
        razorpayPaymentId,
        monthName,
        amountInRupees
      });
    } catch (emailError) {
      console.error("Failed to send receipt emails:", emailError);
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error during verification" }, { status: 500 });
  }
}