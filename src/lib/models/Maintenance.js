import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    issueType: {
      type: String,
      enum: ["plumbing", "electrical", "appliance", "structural", "cleaning", "other"],
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open"
    },
    resolutionNotes: { type: String }, // For landlords to write what they did to fix it
    photos: [{ url: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Maintenance || mongoose.model("Maintenance", maintenanceSchema);