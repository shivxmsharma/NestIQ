import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../../lib/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, phone, avatar, agencyName, reraId } = data;

    await connectDB();

    // Build update object based on allowed fields and user role
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    if (session.user.role === "broker" || session.user.role === "seller") {
      if (agencyName !== undefined) updates.agencyName = agencyName;
      if (reraId !== undefined) updates.reraId = reraId;
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ message: "Profile updated successfully", user }, { status: 200 });
  } catch (error) {
    console.error("PUT Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
