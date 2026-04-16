import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import User from "../../../lib/models/User";
import Property from "../../../lib/models/Property";
import Enquiry from "../../../lib/models/Enquiry";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Perform cascade deletes
    const userId = session.user.id;

    // 1. Delete the user's properties listed for sale (If Seller/Broker)
    await Property.deleteMany({ owner: userId });

    // 2. Delete the user's enquiries
    await Enquiry.deleteMany({
      $or: [{ userId: userId }, { agentId: userId }],
    });

    // 3. Remove user from saved properties lists
    // Mongoose query to pull out the completely deleted user ID from everyone's saved lists (if they were connected somewhere else)

    // 4. Finally delete the user account
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "Account and associated data deleted successfully.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete account", error: error.message },
      { status: 500 }
    );
  }
}
