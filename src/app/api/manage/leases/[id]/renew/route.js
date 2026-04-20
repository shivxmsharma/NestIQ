import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import dbConnect from "../../../../../../lib/db";
import Lease from "../../../../../../lib/models/Lease";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { newRentAmount, newEndDate, newStartDate } = await req.json();

    if (!newRentAmount || !newEndDate || !newStartDate) {
      return NextResponse.json({ error: "Missing required fields for renewal" }, { status: 400 });
    }

    await dbConnect();
    const oldLease = await Lease.findById(id).populate("property");
    if (!oldLease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // Only landlord can renew
    if (oldLease.landlord.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to renew this lease" }, { status: 403 });
    }

    // End / expire the old lease
    oldLease.status = "expired";
    await oldLease.save();

    // Create the new lease record referencing the same property and tenant
    const newLease = new Lease({
      property: oldLease.property._id,
      tenant: oldLease.tenant._id,
      landlord: oldLease.landlord._id,
      startDate: new Date(newStartDate),
      endDate: new Date(newEndDate),
      rentAmount: newRentAmount,
      securityDeposit: oldLease.securityDeposit, // Usually carries over, or define new
      status: "pending",
      notes: "Auto-renewed from lease: " + oldLease._id.toString()
    });

    await newLease.save();

    return NextResponse.json({ message: "Lease renewed successfully", newLeaseId: newLease._id }, { status: 201 });
  } catch (error) {
    console.error("Error renewing lease:", error);
    // Capture Mongoose validation errors for the max 11-month rule
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: Object.values(error.errors).map(e => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
