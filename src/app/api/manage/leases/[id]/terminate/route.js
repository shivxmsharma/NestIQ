import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Lease from "../../../../../../lib/models/Lease";
import Payment from "../../../../../../lib/models/Payment";
import Razorpay from "razorpay";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId } = await params;

    // Parse the body to gracefully get refundMethod, if exists
    let body = {};
    try {
      body = await request.json();
    } catch (e) { }

    const { refundMethod } = body;

    await connectDB();

    const lease = await Lease.findById(leaseId);
    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

    const isLandlord = ["seller", "admin", "broker"].includes(user.role);

    if (isLandlord && lease.landlord.toString() === user.id) {

      // Phase 4: Handle Deposit Refunds via direct Razorpay Integration
      if (refundMethod === "razorpay") {
        const depositPayment = await Payment.findOne({
          lease: leaseId,
          paymentType: "security_deposit",
          status: "paid"
        });

        if (!depositPayment || !depositPayment.razorpayPaymentId) {
          return NextResponse.json({ error: "Original deposit payment not found in Razorpay." }, { status: 400 });
        }

        try {
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          await razorpay.payments.refund(depositPayment.razorpayPaymentId, {
            amount: depositPayment.amount, // amount already in paise
            notes: {
              reason: "Lease Terminated",
              leaseId: lease._id.toString()
            }
          });

          depositPayment.notes = (depositPayment.notes || "") + ` | Refunded via Razorpay on ${new Date().toISOString()}`;
          await depositPayment.save();
        } catch (rzpErr) {
          console.error("Razorpay Refund Error: ", rzpErr);
          return NextResponse.json({ error: "Razorpay refund failed. It may be older than 6 months or unsupported." }, { status: 400 });
        }
      } else if (refundMethod === "manual") {
        lease.notes = (lease.notes || "") + " | Security Deposit marked manually refunded off-platform.";
      }

      lease.status = "terminated";
      await lease.save();
      return NextResponse.json({ success: true, lease });
    } else {
      return NextResponse.json({ error: "Unauthorized or invalid role" }, { status: 403 });
    }
  } catch (error) {
    console.error("[LEASE_TERMINATE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

