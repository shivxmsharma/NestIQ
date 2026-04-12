import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";
import {
  syncPropertiesToAlgolia,         // ✅ fix #4 — singular
  deletePropertyFromAlgolia,
} from "../../../../lib/algolia";

export async function GET(request, { params }) {
  try {
    const { id } = await params;  // ✅ fix #7 — await params

    await connectDB();
    const property = await Property.findById(id)  // ✅ fix #1 — was params.is
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

    const { id } = await params;  // ✅ fix #7

    await connectDB();
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.owner.toString() === session.user.id;  // ✅ fix #2 — was ession
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {  // ✅ fix #3 — was || (blocks everyone)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Property.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    await syncPropertiesToAlgolia(updated.toObject());  // ✅ fix #6 — was never called

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

    const { id } = await params;  // ✅ fix #7

    await connectDB();
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.owner.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {  // ✅ fix #3 — was ||
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Property.findByIdAndDelete(id);
    await deletePropertyFromAlgolia(id);  // ✅ fix #6 — was never called

    return NextResponse.json({ message: "Property deleted" });  // ✅ fix #5 — was .jsi
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}