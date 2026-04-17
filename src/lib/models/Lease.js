import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    landlordSignedAt: { type: Date },
    tenantSignedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "terminated"],
      default: "pending"
    },
    // For securely storing the digital lease agreement PDF links later
    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Lease || mongoose.model("Lease", leaseSchema);