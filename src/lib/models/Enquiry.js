// src/lib/models/Enquiry.js
import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "replied", "closed", "spam"],
      default: "pending",
    },
    // Visit scheduling
    visitRequested: {
      type: Boolean,
      default: false,
    },
    visitDate: {
      type: Date,
    },
    visitStatus: {
      type: String,
      enum: ["not-requested", "pending", "confirmed", "cancelled", "completed"],
      default: "not-requested",
    },
    // Broker assigns lead
    isLeadAssigned: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

EnquirySchema.index({ property: 1 });
EnquirySchema.index({ sender: 1 });
EnquirySchema.index({ receiver: 1 });

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);

export default Enquiry;