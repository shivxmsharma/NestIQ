import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    buyerUnread: { type: Number, default: 0 },
    sellerUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One conversation per (buyer + seller + property)
ConversationSchema.index({ property: 1, buyer: 1, seller: 1 }, { unique: true });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);