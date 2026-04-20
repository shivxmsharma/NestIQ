import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import User from "../../../../lib/models/User";
import { sendWelcomeEmail } from "../../../../lib/emailTemplates";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("verify-email error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
