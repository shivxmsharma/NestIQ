import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Lease from "../../../../lib/models/Lease";
import Property from "../../../../lib/models/Property";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const isLandlord = ["seller", "broker"].includes(session.user.role);

    // If landlord, fetch leases where they are the landlord. If tenant, where they are the tenant.
    const query = isLandlord ? { landlord: session.user.id } : { tenant: session.user.id };

    const leases = await Lease.find(query)
      .populate("property", "title address photos propertyType")
      .populate(isLandlord ? "tenant" : "landlord", "name email phone avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, leases });
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["seller", "broker"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { property, tenantEmail, rentAmount, securityDeposit, startDate, endDate } = body;

    if (!property || !tenantEmail || !rentAmount || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Look up the tenant by email
    const User = require("../../../../lib/models/User").default || require("../../../../lib/models/User");
    const tenantUser = await User.findOne({ email: tenantEmail.toLowerCase() });

    if (!tenantUser) {
      return NextResponse.json({ error: "Tenant user not found with that email" }, { status: 404 });
    }

    // Ensure the landlord actually owns the property
    const prop = await Property.findOne({ _id: property, owner: session.user.id });
    if (!prop) {
      return NextResponse.json({ error: "Property not found or unauthorized" }, { status: 403 });
    }

    // Create the lease
    const newLease = await Lease.create({
      property,
      landlord: session.user.id,
      tenant: tenantUser._id,
      rentAmount,
      securityDeposit: securityDeposit || 0,
      startDate,
      endDate,
      status: "pending",
      customTerms: body.customTerms || []
    });

    return NextResponse.json({ success: true, lease: newLease }, { status: 201 });
  } catch (error) {
    console.error("Error creating lease:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
