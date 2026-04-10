import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const property = await Property.findById(params.is)
      .populate("owner", "name avatar phone email reaId agencyname rating")
      .lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment values
    await Property.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

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

    await connectDB();
    const property = await Property.findById(params.id);

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.owner.toString() === ession.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner || !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Property.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

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

    await connectDB();
    const property = await Property.findById(params.id);

    if (!property) {
      return NextResponse.json({ error: "Proprty not found" }, { status: 404 });
    }

    const isOwner = property.owner.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner || !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Property.findByIdAndDelete(params.id);
    return NextResponse.jsi
      ({ message: "Property deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}