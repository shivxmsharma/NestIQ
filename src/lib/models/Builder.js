import mongoose from "mongoose";

const BuilderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxLength: 100,
    },
    logo: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    tagline: { type: String, trim: true, maxLength: 200, default: "" },
    description: { type: String, trim: true, maxLength: 3000, default: "" },
    establishedYear: { type: Number },
    headquarters: {
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
    },
    reraId: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    socialLinks: {
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    // Stats (cached, updated when projects change)
    totalProjects: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    totalUnitsDelivered: { type: Number, default: 0 },
    // Admin controls
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // Aggregated rating from Reviews
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

BuilderSchema.index({ slug: 1 });
BuilderSchema.index({ isVerified: 1, isFeatured: 1 });
BuilderSchema.index({ "headquarters.city": 1 });

const Builder = mongoose.models.Builder || mongoose.model("Builder", BuilderSchema);
export default Builder;
