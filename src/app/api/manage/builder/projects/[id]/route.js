import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Builder from "../../../../../../lib/models/Builder";
import Project from "../../../../../../lib/models/Project";
import algoliasearch from "algoliasearch";

async function updateAlgolia(project, builderId) {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) return;
  try {
    const { default: Builder } = await import("../../../../../../lib/models/Builder");
    const builder = await Builder.findById(builderId).lean();
    const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
    const index = client.initIndex("nestiq_projects");
    await index.partialUpdateObject({
      objectID: project._id.toString(),
      title: project.title,
      status: project.status,
      projectType: project.projectType,
      city: project.location?.city || "",
      locality: project.location?.locality || "",
      priceMin: project.priceRange?.min || 0,
      priceMax: project.priceRange?.max || 0,
      availableUnits: project.availableUnits || 0,
      configurations: project.configurations?.map((c) => c.type) || [],
      amenities: project.amenities || [],
      isFeatured: project.isFeatured || false,
      isReraVerified: project.isReraVerified || false,
      coverImage: project.coverImage || "",
      builderVerified: builder?.isVerified || false,
    }, { createIfNotExists: true });
  } catch (err) {
    console.error("[ALGOLIA_UPDATE_PROJECT]", err.message);
  }
}

async function deleteFromAlgolia(projectId) {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) return;
  try {
    const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
    await client.initIndex("nestiq_projects").deleteObject(projectId.toString());
  } catch (err) {
    console.error("[ALGOLIA_DELETE_PROJECT]", err.message);
  }
}

async function getBuilderAndVerify(session) {
  const builder = await Builder.findOne({ user: session.user.id }).lean();
  return builder;
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const builder = await getBuilderAndVerify(session);
    if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    const project = await Project.findOne({ _id: id, builder: builder._id }).lean();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ success: true, project });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const builder = await getBuilderAndVerify(session);
    if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 404 });

    const body = await req.json();
    const allowed = ["title", "description", "status", "projectType", "location", "priceRange", "configurations", "amenities", "highlights", "launchDate", "possessionDate", "totalUnits", "availableUnits", "reraNumber", "isReraVerified", "coverImage", "gallery", "documents"];
    const updates = {};
    allowed.forEach((f) => { if (body[f] !== undefined) updates[f] = body[f]; });

    const project = await Project.findOneAndUpdate(
      { _id: id, builder: builder._id },
      { $set: updates },
      { new: true }
    ).lean();

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    
    // Update Algolia (non-blocking)
    updateAlgolia(project, builder._id);
    
    return NextResponse.json({ success: true, project });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { id } = await params;
    const builder = await getBuilderAndVerify(session);
    if (!builder) return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    const project = await Project.findOneAndDelete({ _id: id, builder: builder._id });
    if (project) {
      await Builder.findByIdAndUpdate(builder._id, { $inc: { totalProjects: -1 } });
      deleteFromAlgolia(project._id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
