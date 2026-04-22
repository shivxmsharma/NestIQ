import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Builder from "../../../../../lib/models/Builder";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const builder = await Builder.findOne({ user: session.user.id })
      .populate("user", "name email avatar phone")
      .lean();

    if (!builder) return NextResponse.json({ error: "Builder profile not found. Contact admin." }, { status: 404 });

    return NextResponse.json({ builder });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const allowed = ["tagline", "description", "website", "socialLinks", "headquarters", "establishedYear", "reraId", "logo", "coverImage"];
    const updates = {};
    allowed.forEach((field) => { if (body[field] !== undefined) updates[field] = body[field]; });

    const builder = await Builder.findOneAndUpdate(
      { user: session.user.id },
      { $set: updates },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, builder });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
