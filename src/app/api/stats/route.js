import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Property from "../../../lib/models/Property";
import User from "../../../lib/models/User";
import Enquiry from "../../../lib/models/Enquiry";

// Revalidate every 60 seconds (ISR-style caching)
export const revalidate = 60;

export async function GET() {
  try {
    await connectDB();

    const [
      totalProperties,
      totalUsers,
      verifiedBrokers,
      totalEnquiries,
      citiesAgg,
    ] = await Promise.all([
      Property.countDocuments({ status: "active" }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ["broker", "seller"] } }),
      Enquiry.countDocuments({}),
      Property.distinct("address.city", { status: "active" }),
    ]);

    return NextResponse.json({
      totalProperties,
      totalUsers,
      verifiedBrokers,
      totalEnquiries,
      totalCities: citiesAgg.length || 3,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { totalProperties: 0, totalUsers: 0, verifiedBrokers: 0, totalEnquiries: 0, totalCities: 3 },
      { status: 500 }
    );
  }
}
