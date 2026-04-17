import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Property from "../../../../lib/models/Property";
import Lease from "../../../../lib/models/Lease";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["seller", "admin", "broker"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch landlord's properties
    const properties = await Property.find({
      owner: session.user.id,
      listingType: { $in: ["rent", "pg"] }
    })
      .select("title location propertyType price photos")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch leases for these properties to determine if they're vacant or occupied
    const propIds = properties.map(p => p._id);
    const leases = await Lease.find({ property: { $in: propIds }, status: "active" })
      .populate("tenant", "name email avatar")
      .lean();

    // Attach lease data to properties
    const merged = properties.map(p => {
      // Find active lease for this property if it exists
      const lease = leases.find(l => l.property.toString() === p._id.toString());
      return {
        ...p,
        lease: lease || null,
        isOccupied: !!lease
      };
    });

    return NextResponse.json({ properties: merged }, { status: 200 });
  } catch (error) {
    console.error("[MANAGE_PROPERTIES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
