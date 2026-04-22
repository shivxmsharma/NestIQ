import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Builder from "../../../lib/models/Builder";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    const query = { isVerified: true, isActive: true };
    if (city) query["headquarters.city"] = new RegExp(city, "i");
    if (featured === "true") query.isFeatured = true;

    const [builders, total] = await Promise.all([
      Builder.find(query)
        .populate("user", "name email avatar")
        .sort({ isFeatured: -1, totalProjects: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Builder.countDocuments(query),
    ]);

    return NextResponse.json({ builders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/builders]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
