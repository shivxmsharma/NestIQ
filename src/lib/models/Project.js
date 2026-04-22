import mongoose from "mongoose";

const ConfigurationSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true },        // e.g. "2 BHK", "3 BHK", "Studio"
    area: { type: Number },                    // sq.ft
    price: { type: Number },                   // base price in INR
    availableUnits: { type: Number, default: 0 },
  },
  { _id: false }
);

const ConstructionUpdateSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, default: "" },
  },
  { timestamps: false }
);

const ProjectDocumentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["rera", "brochure", "floorplan", "other"],
      default: "other",
    },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Builder",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxLength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true, maxLength: 5000, default: "" },
    coverImage: { type: String, default: "" },
    gallery: [{ url: String, publicId: String }],

    location: {
      street: { type: String, trim: true, default: "" },
      locality: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "Chandigarh" },
      state: { type: String, trim: true, default: "Punjab" },
      pincode: { type: String, trim: true, default: "" },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [76.7794, 30.7333] },
      },
    },

    projectType: {
      type: String,
      enum: ["Residential", "Commercial", "Mixed-Use", "Villa", "Township", "Plots"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Under Construction", "Ready to Move", "Completed"],
      default: "Upcoming",
    },

    launchDate: { type: Date },
    possessionDate: { type: Date },

    totalUnits: { type: Number, default: 0 },
    availableUnits: { type: Number, default: 0 },

    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    configurations: [ConfigurationSchema],
    amenities: [{ type: String }],
    highlights: [{ type: String }],    // Key selling points

    constructionUpdates: [ConstructionUpdateSchema],
    documents: [ProjectDocumentSchema],

    reraNumber: { type: String, trim: true, default: "" },
    isReraVerified: { type: Boolean, default: false },

    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    interestCount: { type: Number, default: 0 },

    // Linked auto-created Property listings
    linkedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
  },
  { timestamps: true }
);

ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ builder: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isFeatured: 1 });
ProjectSchema.index({ "location.city": 1 });
ProjectSchema.index({ "location.coordinates": "2dsphere" });

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export default Project;
