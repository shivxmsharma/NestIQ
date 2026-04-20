import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import User from "../../../../../../lib/models/User";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent superadmin from suspending themselves
    if (userToUpdate._id.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot suspend your own superadmin account." }, { status: 400 });
    }

    userToUpdate.isActive = isActive;
    await userToUpdate.save();

    return NextResponse.json({ success: true, user: userToUpdate });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}