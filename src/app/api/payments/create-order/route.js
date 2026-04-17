import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";
import Payment from "../../../../lib/models/Payment";
import Razorpay from "razorpay";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { propertyId, rentMonth, rentYear, notes } = body;

  if (!propertyId || !rentMonth || !rentYear)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await connectDB();

  const property = await Property.findById(propertyId).populate("owner", "name email");
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  if (property.listingType !== "rent")
    return NextResponse.json({ error: "Not a rental property" }, { status: 400 });

  // Check if already paid for this month
  const existing = await Payment.findOne({
    property: propertyId,
    tenant: session.user.id,
    rentMonth,
    rentYear,
    status: "paid",
  });
  if (existing) return NextResponse.json({ error: "Rent already paid for this month" }, { status: 409 });

  const amountInPaise = property.price * 100; // property.price is monthly rent in ₹

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `rent_${propertyId}_${rentMonth}_${rentYear.toString().substring(2)}_${Date.now().toString().substring(8)}`,
    notes: {
      propertyId,
      tenantId: session.user.id,
      rentMonth,
      rentYear,
    },
  });

  // Save pending payment record
  const payment = await Payment.create({
    property: propertyId,
    tenant: session.user.id,
    landlord: property.owner._id,
    amount: amountInPaise,
    razorpayOrderId: order.id,
    rentMonth,
    rentYear,
    notes: notes || "",
    status: "created",
  });

  return NextResponse.json({
    orderId: order.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    paymentId: payment._id,
  });
}