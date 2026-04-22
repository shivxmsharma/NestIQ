import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Builder from "../../../../../lib/models/Builder";
import Project from "../../../../../lib/models/Project";
import algoliasearch from "algoliasearch";

function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

async function pushToAlgolia(project, builder) {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) return;
  try {
    const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
    const index = client.initIndex("nestiq_projects");
    await index.saveObject({
      objectID: project._id.toString(),
      title: project.title,
      slug: project.slug,
      status: project.status,
      projectType: project.projectType,
      city: project.location?.city || "",
      locality: project.location?.locality || "",
      state: project.location?.state || "",
      priceMin: project.priceRange?.min || 0,
      priceMax: project.priceRange?.max || 0,
      totalUnits: project.totalUnits || 0,
      availableUnits: project.availableUnits || 0,
      configurations: project.configurations?.map((c) => c.type) || [],
      amenities: project.amenities || [],
      builderName: builder?.companyName || "",
      builderSlug: builder?.slug || "",
      builderVerified: builder?.isVerified || false,
      coverImage: project.coverImage || "",
      isFeatured: project.isFeatured || false,
      isReraVerified: project.isReraVerified || false,
      reraNumber: project.reraNumber || "",
      possessionDate: project.possessionDate ? new Date(project.possessionDate).getTime() : null,
      createdAt: project.createdAt ? new Date(project.createdAt).getTime() : Date.now(),
      ...(project.location?.coordinates?.coordinates?.length === 2 && {
        _geoloc: {
          lat: project.location.coordinates.coordinates[1],
          lng: project.location.coordinates.coordinates[0],
        },
      }),
    });
  } catch (err) {
    console.error("[ALGOLIA_PUSH_PROJECT]", err.message);
    // Non-fatal — DB write already succeeded
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const builder = await Builder.findOne({ user: session.user.id }).lean();
    if (!builder) return NextResponse.json({ error: "Builder profile not found" }, { status: 404 });

    const projects = await Project.find({ builder: builder._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, projects });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "builder")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const builder = await Builder.findOne({ user: session.user.id });
    if (!builder) return NextResponse.json({ error: "Builder profile not found" }, { status: 404 });

    const body = await req.json();
    const { title, description, projectType, status, location, priceRange, configurations, amenities, highlights, launchDate, possessionDate, totalUnits, availableUnits, reraNumber, coverImage } = body;

    if (!title || !projectType) return NextResponse.json({ error: "Title and project type are required" }, { status: 400 });

    const project = await Project.create({
      builder: builder._id,
      slug: makeSlug(title),
      title, description, projectType,
      status: status || "Upcoming",
      location, priceRange, configurations,
      amenities, highlights, launchDate, possessionDate,
      totalUnits, availableUnits, reraNumber, coverImage,
    });

    // Update builder stats
    await Builder.findByIdAndUpdate(builder._id, { $inc: { totalProjects: 1 } });

    // Push to Algolia (non-blocking)
    pushToAlgolia(project.toObject(), builder);

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
