import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";
import User from "../../../../lib/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await connectDB();

    // Fetch all properties, sorted by newest first, and populate the owner details
    const properties = await Property.find({})
      .populate({
        path: 'owner',
        model: User,
        select: 'name email role avatar'
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ properties }, { status: 200 });
  } catch (error) {
    console.error("Admin Properties GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
