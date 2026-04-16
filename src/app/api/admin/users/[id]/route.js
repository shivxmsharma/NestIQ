import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import User from "../../../../../lib/models/User";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Strict Admin Verification
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Validate payload
    if (!body || !body.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Role enum validation
    const validRoles = ['admin', 'broker', 'seller', 'buyer'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    await connectDB();

    // Prevent the only admin from removing their own admin privileges by accident
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id === session.user.id && body.role !== 'admin') {
      // Count remaining admins
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the ultimate platform administrator." }, { status: 400 });
      }
    }

    // Process update
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: body.role },
      { new: true, runValidators: true }
    ).select("-password").lean();

    return NextResponse.json({ message: "User role updated successfully", user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Admin Users Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
