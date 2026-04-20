import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/db";
import Review from "../../../lib/models/Review";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { revieweeId, propertyId, rating, comment } = await req.json();

    if (!revieweeId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (session.user.id === revieweeId) {
      return NextResponse.json(
        { error: "You cannot review yourself" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: session.user.id,
      property: propertyId,
      reviewee: revieweeId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this context" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      reviewer: session.user.id,
      reviewee: revieweeId,
      property: propertyId || undefined,
      rating,
      comment,
      status: "published",
    });

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
