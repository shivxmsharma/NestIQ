import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Enquiry from "../../../../lib/models/Enquiry";
import User from "../../../../lib/models/User";
import Property from "../../../../lib/models/Property";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await connectDB();

    // Fetch all enquiries, populate buyer, owner, and property
    const enquiries = await Enquiry.find({})
      .populate({
        path: 'buyer',
        model: User,
        select: 'name email role avatar'
      })
      .populate({
        path: 'owner',
        model: User,
        select: 'name email role avatar'
      })
      .populate({
        path: 'property',
        model: Property,
        select: 'title address price photos'
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ enquiries }, { status: 200 });
  } catch (error) {
    console.error("Admin Enquiries GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
