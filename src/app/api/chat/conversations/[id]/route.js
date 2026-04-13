import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import connectDB from "../../../../../lib/db";
import Conversation from "../../../../../lib/models/Conversation";
import Message from "../../../../../lib/models/Message";

// GET — fetch messages, mark as read
export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const params = await context.params;
  const id = params.id;
  const userId = session.user.id;

  const conversation = await Conversation.findById(id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBuyer = conversation.buyer.toString() === userId;
  const isSeller = conversation.seller.toString() === userId;
  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark incoming messages as read
  await Message.updateMany(
    { conversation: id, sender: { $ne: userId }, isRead: false },
    { isRead: true }
  );

  // Reset unread counter for this user
  const unreadField = isBuyer ? { buyerUnread: 0 } : { sellerUnread: 0 };
  await Conversation.findByIdAndUpdate(id, unreadField);

  const messages = await Message.find({ conversation: id })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  return NextResponse.json(messages);
}