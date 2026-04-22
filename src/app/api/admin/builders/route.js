import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Builder from "../../../../lib/models/Builder";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const builders = await Builder.find({})
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ builders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { builderId, ...updates } = await req.json();
    if (!builderId) return NextResponse.json({ error: "Builder ID required" }, { status: 400 });

    await connectDB();
    const builder = await Builder.findByIdAndUpdate(builderId, updates, { new: true });
    if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 404 });

    return NextResponse.json({ builder });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
