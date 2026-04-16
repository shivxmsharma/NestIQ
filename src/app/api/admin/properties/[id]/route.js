import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Property from "../../../../../lib/models/Property";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Body could contain `status` or `isFeatured` flag.
    const updateData = {};
    if (body.status) {
      const allowedStatuses = ["active", "inactive", "pending-review", "sold", "rented"];
      if (allowedStatuses.includes(body.status)) updateData.status = body.status;
      else return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    
    if (typeof body.isFeatured === "boolean") {
      updateData.isFeatured = body.isFeatured;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await connectDB();

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('owner', 'name email').lean();

    if (!updatedProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Property updated successfully", 
      property: updatedProperty 
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Property Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
