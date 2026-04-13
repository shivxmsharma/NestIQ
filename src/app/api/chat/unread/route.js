import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Conversation from "../../../../lib/models/Conversation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  await connectDB();
  const userId = session.user.id;

  const conversations = await Conversation.find({
    $or: [{ buyer: userId }, { seller: userId }],
  }).select("buyer seller buyerUnread sellerUnread");

  const total = conversations.reduce((sum, c) => {
    if (c.buyer.toString() === userId) return sum + (c.buyerUnread || 0);
    return sum + (c.sellerUnread || 0);
  }, 0);

  return NextResponse.json({ count: total });
}