import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    locality: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true, default: "Chandigarh" },
    state: { type: String, trim: true, default: "Punjab" },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

const DetailsSchema = new mongoose.Schema(
  {
    bedrooms: { type: Number, min: 0, max: 20 },
    bathrooms: { type: Number, min: 0, max: 20 },
    area: { type: Number, min: 0 },                  // sq.ft
    floor: { type: Number },
    totalFloors: { type: Number },
    furnishing: {
      type: String,
      enum: ["Unfurnished", "Semi-Furnished", "Fully Furnished", ""],
      default: "",
    },
    constructionStatus: {
      type: String,
      enum: ["Under Construction", "Ready to Move", ""],
      default: "",
    },
    facing: {
      type: String,
      enum: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West", ""],
      default: "",
    },
    ageOfProperty: { type: Number },                 // in years
  },
  { _id: false }
);

const CoordinateSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [76.7794, 30.7333] },
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 2000,
    },

    // --- Core listing fields (matches form exactly) ---
    listingType: {
      type: String,
      required: true,
      enum: ["buy", "rent", "pg"],
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["Apartment", "Villa", "Independent House", "Plot", "Studio", "Penthouse", "Builder Floor"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    address: {
      type: AddressSchema,
      required: true,
    },
    details: {
      type: DetailsSchema,
    },

    amenities: [{ type: String }],
    photos: [PhotoSchema],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Location for map ---
    location: {
      type: CoordinateSchema,
    },

    // --- NestIQ competitive edge ---
    trustScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    isReraVerified: {
      type: Boolean,
      default: false,
    },
    reraNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // --- Hyper-local intelligence (Step 7) ---
    localityIntelligence: {
      walkabilityScore: { type: Number },
      nearestMetroDistance: { type: Number },
      nearestSchoolDistance: { type: Number },
      airQualityIndex: { type: Number },
    },

    // --- Status & metrics ---
    status: {
      type: String,
      enum: ["active", "inactive", "sold", "rented", "pending-review"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
    },
    enquiryCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    availableFrom: {
      type: Date,
    },

    // --- PG specific ---
    pgDetails: {
      genderAllowed: {
        type: String,
        enum: ["male", "female", "any", ""],
        default: "",
      },
      mealsIncluded: { type: Boolean, default: false },
      occupancyType: {
        type: String,
        enum: ["single", "double", "triple", "any", ""],
        default: "",
      },
    },
  },
  { timestamps: true }
);

// Geospatial index for map queries (Step 4)
PropertySchema.index({ location: "2dsphere" });

// Full-text search
PropertySchema.index({ title: "text", description: "text", "address.locality": "text" });

// Common query indexes
PropertySchema.index({ "address.city": 1, status: 1 });
PropertySchema.index({ listingType: 1, propertyType: 1 });
PropertySchema.index({ owner: 1 });
PropertySchema.index({ price: 1 });

const Property =
  mongoose.models.Property || mongoose.model("Property", PropertySchema);

export default Property;