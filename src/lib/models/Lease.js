import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          if (!this.startDate) return true;
          const start = new Date(this.startDate);
          const end = new Date(value);
          // Calculate the difference in months
          const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          const diffDays = end.getDate() - start.getDate();
          const totalMonths = diffMonths + (diffDays > 0 ? 1 : 0);
          return totalMonths <= 11;
        },
        message: 'Lease duration cannot exceed 11 months'
      }
    },
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
    notes: { type: String },

    // AutoPay Integration
    autoPayEnabled: { type: Boolean, default: false },
    razorpaySubscriptionId: { type: String },
    razorpayPlanId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Lease || mongoose.model("Lease", leaseSchema);