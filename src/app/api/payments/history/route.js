import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Payment from "../../../../lib/models/Payment";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "tenant"; // tenant | landlord

  const query = role === "landlord"
    ? { landlord: session.user.id, status: "paid" }
    : { tenant: session.user.id, status: "paid" };

  const payments = await Payment.find(query)
    .populate("property", "propertyType address price")
    .populate("tenant", "name email avatar")
    .populate("landlord", "name email avatar")
    .sort({ createdAt: -1 });

  return NextResponse.json({ payments });
}