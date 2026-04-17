import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },          // in paise (₹1 = 100 paise)
    currency: { type: String, default: "INR" },
    paymentType: { type: String, enum: ["rent", "security_deposit"], default: "rent" },
    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    rentMonth: { type: Number },          // 1–12
    rentYear: { type: Number },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent duplicate rent payment for same property+tenant+month+year unless it's a deposit
PaymentSchema.index(
  { property: 1, tenant: 1, rentMonth: 1, rentYear: 1, paymentType: 1 },
  { unique: true, partialFilterExpression: { status: "paid", paymentType: "rent" } }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);