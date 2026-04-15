import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '../../../lib/auth';
import connectDB from "../../../lib/db";
import Property from '../../../lib/models/Property';
import User from '../../../lib/models/User';
import { syncPropertiesToAlgolia } from "../../../lib/algolia";
import { calculateTrustScore } from "../../../lib/trustScore";

// GET /api/properties - browse/filter listings
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const listingType = searchParams.get("listingType"); //buy | rent | pg
    const propertyType = searchParams.get("propertyType");
    const city = searchParams.get("city");
    const locality = searchParams.get("locality");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const query = { status: "active" };

    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;
    if (city) query["address.city"] = new RegExp(city, "i");
    if (locality) query["address.locality"] = new RegExp(locality, "i");
    if (bedrooms) query["details.bedrooms"] = parseInt(bedrooms);

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("owner", "name avatar phone")
        .lean(),
      Property.countDocuments(query),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/properties - create new listing
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["seller", "broker", "admin"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only sellers and brokers can list properties" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Basic validation
    const required = ["title", "listingType", "propertyType", "price", "address", "details"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 },
        );
      }
    }

    const property = await Property.create({
      ...body,
      owner: session.user.id,
      status: "active",
    });

    try {
      const owner = await User.findById(session.user.id).select("phone isVerified").lean();
      const score = calculateTrustScore(property, owner);
      property.trustScore = score;
      await property.save();
    } catch (e) {
      console.warn("[TrustScore] Could not calculate:", e.message);
    }

    await syncPropertiesToAlgolia(property.toObject());

    return NextResponse.json(
      { message: "Property listed successfully", property },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}