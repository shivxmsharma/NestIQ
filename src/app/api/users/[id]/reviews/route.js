import dbConnect from "../../../../../lib/db";
import Review from "../../../../../lib/models/Review";
import "../../../../../lib/models/User";
import "../../../../../lib/models/Property";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = (await params); // reviewee (User) ID

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    await dbConnect();

    // Fetch published reviews only
    const reviews = await Review.find({
      reviewee: id,
      status: "published",
    })
      .populate("reviewer", "name avatar role")
      .populate("property", "title location.city location.state")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
