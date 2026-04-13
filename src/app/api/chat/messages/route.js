import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Conversation from "../../../../lib/models/Conversation";
import Message from "../../../../lib/models/Message";
import pusher from "../../../../lib/pusher";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { conversationId, text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const isBuyer = conversation.buyer.toString() === userId;
  const isSeller = conversation.seller.toString() === userId;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Save message
  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    text: text.trim(),
  });
  await message.populate("sender", "name avatar");

  // Update conversation preview + increment other party's unread
  const unreadIncrement = isBuyer
    ? { $inc: { sellerUnread: 1 } }
    : { $inc: { buyerUnread: 1 } };

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text.trim().slice(0, 100),
    lastMessageAt: new Date(),
    ...unreadIncrement,
  });

  // Broadcast overall user updates
  await pusher.trigger(`user-${conversation.buyer.toString()}`, "chat-update", {});
  await pusher.trigger(`user-${conversation.seller.toString()}`, "chat-update", {});

  // Broadcast to Pusher channel
  await pusher.trigger(`conversation-${conversationId}`, "new-message", {
    _id: message._id.toString(),
    text: message.text,
    sender: { _id: userId, name: session.user.name, avatar: session.user.avatar || null },
    createdAt: message.createdAt,
    isRead: false,
  });

  return NextResponse.json(message, { status: 201 });
}