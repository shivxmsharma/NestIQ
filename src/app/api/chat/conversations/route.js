import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Conversation from "../../../../lib/models/Conversation";
import Property from "../../../../lib/models/Property";

// GET — list all conversations for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = session.user.id;

  const conversations = await Conversation.find({
    $or: [{ buyer: userId }, { seller: userId }],
  })
    .populate("property", "title photos address price")
    .populate("buyer", "name avatar")
    .populate("seller", "name avatar")
    .sort({ lastMessageAt: -1 });

  return NextResponse.json(conversations);
}

// POST — find or create conversation for a property
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { propertyId } = await req.json();

    const property = await Property.findById(propertyId);
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const buyerId = session.user.id;
    const sellerId = property.owner?.toString();

    if (!sellerId) return NextResponse.json({ error: "Property has no owner" }, { status: 400 });

    if (buyerId === sellerId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    let conversation = await Conversation.findOne({
      property: propertyId,
      buyer: buyerId,
      seller: sellerId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        buyer: buyerId,
        seller: sellerId,
      });
    }

    await conversation.populate([
      { path: "property", select: "title photos address price" },
      { path: "buyer", select: "name avatar" },
      { path: "seller", select: "name avatar" },
    ]);

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("DEBUG Chat POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}