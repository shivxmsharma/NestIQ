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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId } = await params;
    await connectDB();

    const lease = await Lease.findById(leaseId).populate("property");
    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    if (lease.tenant.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (lease.status !== "pending") {
      return NextResponse.json({ error: "Deposit already paid or lease not pending" }, { status: 400 });
    }

    const existingDeposit = await Payment.findOne({
      lease: leaseId,
      paymentType: "security_deposit",
      status: "paid"
    });
    if (existingDeposit) {
      return NextResponse.json({ error: "Deposit already paid" }, { status: 409 });
    }

    const amountInPaise = lease.securityDeposit * 100; // security deposit in paise

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `deposit_${leaseId}_${Date.now().toString().substring(8)}`,
      notes: {
        leaseId: leaseId.toString(),
        paymentType: "security_deposit",
        tenantId: session.user.id
      },
    });

    // Create pending payment record
    const payment = await Payment.create({
      lease: leaseId,
      property: lease.property._id,
      tenant: session.user.id,
      landlord: lease.landlord,
      amount: amountInPaise,
      paymentType: "security_deposit",
      razorpayOrderId: order.id,
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("[DEPOSIT_CREATE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}