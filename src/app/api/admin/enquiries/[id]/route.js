import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Enquiry from "../../../../../lib/models/Enquiry";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const allowedStatuses = ["pending", "responded", "closed", "spam"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updateData = {};
    if (body.status) updateData.status = body.status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await connectDB();

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('buyer', 'name email avatar')
      .populate('owner', 'name email avatar')
      .populate('property', 'title')
      .lean();

    if (!updatedEnquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Enquiry updated successfully",
      enquiry: updatedEnquiry
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Enquiry Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
