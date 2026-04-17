import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Maintenance from "../../../../lib/models/Maintenance";
import Lease from "../../../../lib/models/Lease";
import Property from "../../../../lib/models/Property";
import User from "../../../../lib/models/User";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const isLandlord = ["seller", "admin", "broker"].includes(user.role);

    let query = {};
    if (isLandlord) {
      // Find properties owned by this landlord
      const ownedProperties = await Property.find({ owner: user.id }).select('_id');
      const propertyIds = ownedProperties.map(p => p._id);

      // Find leases for these properties
      const activeLeases = await Lease.find({ property: { $in: propertyIds } }).select('_id');
      const leaseIds = activeLeases.map(l => l._id);

      query = { landlord: user.id };
    } else {
      // Find tickets filed by this tenant
      query = { tenant: user.id };
    }

    const tickets = await Maintenance.find(query)
      .populate('property', 'title location.address')
      .populate('tenant', 'name email avatar')
      .populate('landlord', 'name email avatar')
      .sort("-createdAt")
      .lean();

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[MAINTENANCE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    let { title, description, category, priority, leaseId } = body;

    if (!title || !description || !category || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // If the tenant didn't specify a lease ID (which is normal for 99% of tenants), auto-fetch their active lease
    if (!leaseId) {
      const activeLease = await Lease.findOne({ tenant: user.id, status: 'active' });
      if (!activeLease) {
        return NextResponse.json({ error: "No active lease found. You must have an active lease to raise a ticket." }, { status: 403 });
      }
      leaseId = activeLease._id;
    }

    // Verify lease exists and tenant is part of it
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    if (lease.tenant.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized to log tickets for this lease" }, { status: 403 });
    }

    const ticket = await Maintenance.create({
      lease: leaseId,
      property: lease.property,
      tenant: lease.tenant,
      landlord: lease.landlord,
      title,
      description,
      issueType: category,
      priority: priority === 'urgent' ? 'emergency' : priority,
      status: "open",
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("[MAINTENANCE_POST]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}