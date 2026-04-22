import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Project from "../../../../../../lib/models/Project";
import ProjectInterest from "../../../../../../lib/models/ProjectInterest";
import User from "../../../../../../lib/models/User";

export async function GET(req, { params }) {
  // Buyer checks if they already expressed interest
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { slug } = await params;
    const project = await Project.findOne({ slug }).lean();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const existing = await ProjectInterest.findOne({ project: project._id, buyer: session.user.id }).lean();
    return NextResponse.json({ hasInterest: !!existing, interest: existing });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { slug } = await params;
    const body = await req.json();
    const { interestedConfig, budget, message } = body;

    const project = await Project.findOne({ slug });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const user = await User.findById(session.user.id).select("name email phone").lean();

    // Upsert — one interest per buyer per project
    const interest = await ProjectInterest.findOneAndUpdate(
      { project: project._id, buyer: session.user.id },
      {
        builder: project.builder,
        interestedConfig: interestedConfig || "",
        budget: budget || null,
        message: message || "",
        contactName: user.name,
        contactEmail: user.email,
        contactPhone: user.phone || "",
        status: "new",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Increment interest count on project
    await Project.findByIdAndUpdate(project._id, { $inc: { interestCount: 1 } });

    return NextResponse.json({ success: true, interest });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "You have already expressed interest in this project." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
