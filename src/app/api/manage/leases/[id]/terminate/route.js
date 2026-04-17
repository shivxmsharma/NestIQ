import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Lease from "../../../../../../lib/models/Lease";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: leaseId } = await params;
    await connectDB();

    const lease = await Lease.findById(leaseId);
    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });

    const isLandlord = ["seller", "admin", "broker"].includes(user.role);

    if (isLandlord && lease.landlord.toString() === user.id) {
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
