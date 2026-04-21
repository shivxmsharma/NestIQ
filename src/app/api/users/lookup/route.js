import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../../lib/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ user: null });
    }

    await connectDB();
    const user = await User.findOne({ email }).select("name email avatar role").lean();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[USER_LOOKUP]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
