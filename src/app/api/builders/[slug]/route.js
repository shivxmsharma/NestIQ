import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Builder from "../../../../lib/models/Builder";
import Project from "../../../../lib/models/Project";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const builder = await Builder.findOne({ slug, isActive: true })
      .populate("user", "name email avatar")
      .lean();

    if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 404 });

    const projects = await Project.find({ builder: builder._id })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      builder: { ...builder, _id: builder._id.toString() },
      projects: projects.map((p) => ({ ...p, _id: p._id.toString() })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
