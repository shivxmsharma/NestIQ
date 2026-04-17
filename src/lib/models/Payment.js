import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },          // in paise (₹1 = 100 paise)
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    rentMonth: { type: Number, required: true },          // 1–12
    rentYear: { type: Number, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate payment for same property+tenant+month+year
PaymentSchema.index(
  { property: 1, tenant: 1, rentMonth: 1, rentYear: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);