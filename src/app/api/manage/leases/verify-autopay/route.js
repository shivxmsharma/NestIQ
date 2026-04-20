import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lease from "@/lib/models/Lease";
import Payment from "@/lib/models/Payment";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature, leaseId } = await request.json();

    if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required Razorpay parameters" }, { status: 400 });
    }

    await connectDB();

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature from Razorpay. Security Match Failed." }, { status: 400 });
    }

    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return NextResponse.json({ error: "Lease not found." }, { status: 404 });
    }

    // Success! Update Lease to track that Autopay is officially running.
    lease.autoPayEnabled = true;
    await lease.save();

    // Log the first instance of rent being paid inside the payment schema!
    // Razorpay Subscriptions typically charge the first cycle instantly upon setup authentication unless configured otherwise in the plan setup phase
    const payment = new Payment({
      property: lease.property,
      tenant: lease.tenant,
      landlord: lease.landlord,
      amount: lease.rentAmount * 100, // paise
      currency: "INR",
      paymentType: "rent",
      lease: lease._id,
      razorpayOrderId: razorpaySubscriptionId, // Fallback logging
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      status: "paid",
      rentMonth: new Date().getMonth(),
      rentYear: new Date().getFullYear(),
      notes: "First Rent Cycle - AutoPay Subscription Link Initiated / Re-confirmed"
    });

    await payment.save();

    return NextResponse.json({ success: true, paymentId: payment._id });
  } catch (error) {
    console.error("[VERIFY_AUTOPAY_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
