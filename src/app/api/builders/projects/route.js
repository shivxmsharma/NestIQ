import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import Builder from "../../../../lib/models/Builder";
import Project from "../../../../lib/models/Project";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    const query = {};
    if (city) query["location.city"] = new RegExp(city, "i");
    if (status) query.status = status;
    if (type) query.projectType = type;
    if (featured === "true") query.isFeatured = true;
    if (minPrice) query["priceRange.min"] = { $gte: parseInt(minPrice) };
    if (maxPrice) query["priceRange.max"] = { $lte: parseInt(maxPrice) };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate("builder", "companyName slug logo isVerified")
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    return NextResponse.json({
      projects: projects.map((p) => ({ ...p, _id: p._id.toString() })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
