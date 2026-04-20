import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Lease from "../../../../../../lib/models/Lease";
import Razorpay from "razorpay";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId } = await params;
    await connectDB();

    const lease = await Lease.findById(leaseId).populate("property");
    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

    // Only the tenant attached to the lease can set up AutoPay
    if (lease.tenant.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (lease.status !== "active") {
      return NextResponse.json({ error: "Lease must be active before you can set up AutoPay" }, { status: 400 });
    }
    if (lease.autoPayEnabled) {
      return NextResponse.json({ error: "AutoPay is already enabled for this lease" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    let planId = lease.razorpayPlanId;

    // Create a plan if we haven't created one for this lease yet
    if (!planId) {
      const plan = await razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: `Rent AutoPay - ${lease.property?.title}`,
          amount: lease.rentAmount * 100, // strictly in paise
          currency: "INR",
          description: `Automatically deducts monthly rent for Lease ${leaseId}`
        },
      });
      planId = plan.id;
      lease.razorpayPlanId = planId;
      await lease.save();
    }

    // Now, create the subscription using that plan
    const { totalMonths } = calculateRemainingMonths(lease.endDate);

    // We only want it to run for the duration of the lease
    const subscriptionOptions = {
      plan_id: planId,
      customer_notify: 1,
      total_count: totalMonths > 0 ? totalMonths : 11, // fallback to 11 if calculation gets weird
      notes: {
        leaseId: leaseId.toString(),
        tenantId: session.user.id,
      }
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);

    lease.razorpaySubscriptionId = subscription.id;
    await lease.save();

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("[AUTOPAY_CREATE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function calculateRemainingMonths(endDate) {
  const end = new Date(endDate);
  const now = new Date();

  const diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return { totalMonths: diffMonths > 0 ? diffMonths : 1 };
}
