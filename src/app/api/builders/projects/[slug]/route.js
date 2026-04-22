import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Builder from "../../../../../lib/models/Builder";
import Project from "../../../../../lib/models/Project";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const project = await Project.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate({ path: "builder", select: "companyName slug logo coverImage tagline isVerified rating headquarters" })
      .lean();

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ project: { ...project, _id: project._id.toString() } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
