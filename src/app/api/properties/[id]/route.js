import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";
import User from "../../../../lib/models/User";
import { calculateTrustScore } from "../../../../lib/trustScore";
import {
  syncPropertiesToAlgolia,
  deletePropertyFromAlgolia,
} from "../../../../lib/algolia";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();
    const property = await Property.findById(id)
      .populate("owner", "name avatar phone email reaId agencyName rating")
      .lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ property });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.owner.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Property.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    try {
      const owner = await User.findById(updated.owner).select("phone isVerified").lean();
      updated.trustScore = calculateTrustScore(updated, owner);
      await updated.save();
    } catch (e) {
      console.warn("[TrustScore] Recalculation failed:", e.message);
    }

    await syncPropertiesToAlgolia(updated.toObject());

    return NextResponse.json({ property: updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.owner.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Property.findByIdAndDelete(id);
    await deletePropertyFromAlgolia(id);

    return NextResponse.json({ message: "Property deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}