import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Property from "../../../../../../lib/models/Property";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { status } = body; // expecting "active" (approved) or "rejected"

    if (!["active", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status provided" }, { status: 400 });
    }

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    property.status = status;
    await property.save();

    return NextResponse.json({ success: true, property });
  } catch (error) {
    console.error("Error updating property status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}