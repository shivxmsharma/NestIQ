/**
 * NestIQ Demo Seed Script
 * Run: node scripts/seed.mjs
 * Clears existing data and inserts a full demo dataset.
 */

import dotenv from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["buyer", "seller", "broker", "admin"], default: "buyer" },
    phone: String,
    avatar: String,
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    agencyName: String,
    reraId: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String },
    listingType: { type: String, enum: ["buy", "rent", "pg"] },
    propertyType: String,
    price: Number,
    address: {
      street: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
    },
    details: {
      bedrooms: Number,
      bathrooms: Number,
      area: Number,
      floor: Number,
      totalFloors: Number,
      furnishing: String,
      constructionStatus: String,
      facing: String,
      ageOfProperty: Number,
    },
    amenities: [String],
    photos: [{ url: String, publicId: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    trustScore: { type: Number, default: 50 },
    isReraVerified: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [76.7794, 30.7333] },
    },
  },
  { timestamps: true }
);
PropertySchema.index({ location: "2dsphere" });

const EnquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    phone: String,
    message: String,
    enquiryType: { type: String, enum: ["general", "visit", "offer"], default: "general" },
    status: { type: String, enum: ["pending", "responded", "closed", "spam"], default: "pending" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LeaseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startDate: { type: Date },
    endDate: { type: Date },
    rentAmount: { type: Number },
    securityDeposit: { type: Number },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const PaymentSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    paymentType: { type: String, default: "rent" },
    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: { type: String, default: "paid" },
    rentMonth: { type: Number },
    rentYear: { type: Number },
  },
  { timestamps: true }
);

const MaintenanceSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    issueType: { type: String, default: "plumbing" },
    priority: { type: String, default: "medium" },
    status: { type: String, default: "open" },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    rating: { type: Number },
    comment: { type: String },
    status: { type: String, default: "published" },
  },
  { timestamps: true }
);

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEMO_PASSWORD = await bcrypt.hash("Demo@1234", 10);

const USERS = [
  // Admin
  { name: "Arjun Sharma (Admin)", email: "admin@nestiq.in", role: "admin", isVerified: true, phone: "9876500001" },
  // Sellers / Brokers
  { name: "Rajiv Properties", email: "rajiv@nestiq.in", role: "seller", isVerified: true, phone: "9876500002", agencyName: "Rajiv Realty" },
  { name: "Priya Broker", email: "priya@nestiq.in", role: "broker", isVerified: true, phone: "9876500003", agencyName: "Tricity Homes", reraId: "REP1234CHD" },
  { name: "Harinder Singh", email: "harinder@nestiq.in", role: "seller", isVerified: false, phone: "9876500004" },
  { name: "Sunita Realtors", email: "sunita@nestiq.in", role: "broker", isVerified: true, phone: "9876500005", agencyName: "Sunita Realtors", reraId: "REP5678MOH" },
  // Buyers
  { name: "Amit Verma", email: "amit@nestiq.in", role: "buyer", phone: "9876500010" },
  { name: "Kavita Nair", email: "kavita@nestiq.in", role: "buyer", phone: "9876500011" },
  { name: "Rohit Malhotra", email: "rohit@nestiq.in", role: "buyer", phone: "9876500012" },
  { name: "Deepika Rana", email: "deepika@nestiq.in", role: "buyer", phone: "9876500013" },
  { name: "Sanjay Gupta", email: "sanjay@nestiq.in", role: "buyer", phone: "9876500014" },
  { name: "Neha Kapoor", email: "neha@nestiq.in", role: "buyer", phone: "9876500015" },
  { name: "Vikas Anand", email: "vikas@nestiq.in", role: "buyer", phone: "9876500016" },
  { name: "Pooja Mehta", email: "pooja@nestiq.in", role: "buyer", phone: "9876500017" },
];

// Helper to pick random element(s)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

const CHANDIGARH_LOCALITIES = [
  { locality: "Sector 17", city: "Chandigarh", state: "Chandigarh", pincode: "160017", lat: 30.7394, lng: 76.7831 },
  { locality: "Sector 22", city: "Chandigarh", state: "Chandigarh", pincode: "160022", lat: 30.7280, lng: 76.7727 },
  { locality: "Sector 35", city: "Chandigarh", state: "Chandigarh", pincode: "160035", lat: 30.7215, lng: 76.7560 },
  { locality: "Sector 44", city: "Chandigarh", state: "Chandigarh", pincode: "160044", lat: 30.7148, lng: 76.7504 },
  { locality: "Sector 8", city: "Chandigarh", state: "Chandigarh", pincode: "160008", lat: 30.7490, lng: 76.8044 },
  { locality: "Sector 43", city: "Chandigarh", state: "Chandigarh", pincode: "160043", lat: 30.7163, lng: 76.7611 },
  { locality: "Phase 7", city: "Mohali", state: "Punjab", pincode: "160059", lat: 30.7046, lng: 76.7179 },
  { locality: "Phase 11", city: "Mohali", state: "Punjab", pincode: "160062", lat: 30.6944, lng: 76.7283 },
  { locality: "Aerocity", city: "Mohali", state: "Punjab", pincode: "140308", lat: 30.6636, lng: 76.7896 },
  { locality: "Sector 20", city: "Panchkula", state: "Haryana", pincode: "134116", lat: 30.6942, lng: 76.8606 },
  { locality: "Sector 5", city: "Panchkula", state: "Haryana", pincode: "134109", lat: 30.7010, lng: 76.8530 },
  { locality: "Zirakpur", city: "Zirakpur", state: "Punjab", pincode: "140603", lat: 30.6440, lng: 76.8205 },
  { locality: "Kharar", city: "Kharar", state: "Punjab", pincode: "140301", lat: 30.7462, lng: 76.6455 },
];

const AMENITIES_POOL = [
  "Lift", "Parking", "Power Backup", "Security", "CCTV", "Gym",
  "Swimming Pool", "Club House", "Children Play Area", "Garden",
  "Intercom", "Gas Pipeline", "Rainwater Harvesting", "Waste Management",
  "24/7 Water Supply", "Visitor Parking", "Fire Safety", "Wi-Fi",
];

// Realistic Unsplash photo URLs for property types
const PHOTO_SETS = {
  apartment: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  ],
  villa: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  ],
  plot: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
  ],
  office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
  ],
};

function makePhotos(type) {
  const set = PHOTO_SETS[type] || PHOTO_SETS.apartment;
  return set.slice(0, 2).map((url, i) => ({ url, publicId: `seed_${type}_${i}` }));
}

function makeProperties(sellers) {
  const props = [];

  const templates = [
    // Buy listings — apartments
    { listingType: "buy", propertyType: "apartment", bedrooms: 2, price: 4500000, area: 950, furnishing: "semi-furnished", status: "active", isFeatured: true, trustScore: 88 },
    { listingType: "buy", propertyType: "apartment", bedrooms: 3, price: 7200000, area: 1450, furnishing: "fully-furnished", status: "active", isFeatured: true, trustScore: 92 },
    { listingType: "buy", propertyType: "apartment", bedrooms: 2, price: 3800000, area: 850, furnishing: "unfurnished", status: "active", trustScore: 72 },
    { listingType: "buy", propertyType: "apartment", bedrooms: 4, price: 12000000, area: 2200, furnishing: "fully-furnished", status: "active", isFeatured: true, trustScore: 95 },
    { listingType: "buy", propertyType: "apartment", bedrooms: 1, price: 2200000, area: 550, furnishing: "semi-furnished", status: "active", trustScore: 65 },
    // Buy listings — villas
    { listingType: "buy", propertyType: "villa", bedrooms: 4, price: 28000000, area: 3200, furnishing: "semi-furnished", status: "active", isFeatured: true, trustScore: 90 },
    { listingType: "buy", propertyType: "villa", bedrooms: 3, price: 18000000, area: 2400, furnishing: "unfurnished", status: "active", trustScore: 78 },
    // Buy listings — plots
    { listingType: "buy", propertyType: "plot", price: 6500000, area: 200, status: "active", trustScore: 70 },
    { listingType: "buy", propertyType: "plot", price: 3200000, area: 125, status: "active", trustScore: 60 },
    // Rent listings
    { listingType: "rent", propertyType: "apartment", bedrooms: 2, price: 22000, area: 900, furnishing: "semi-furnished", status: "active", isFeatured: true, trustScore: 85 },
    { listingType: "rent", propertyType: "apartment", bedrooms: 3, price: 35000, area: 1400, furnishing: "fully-furnished", status: "active", trustScore: 80 },
    { listingType: "rent", propertyType: "apartment", bedrooms: 1, price: 12000, area: 500, furnishing: "unfurnished", status: "active", trustScore: 68 },
    { listingType: "rent", propertyType: "apartment", bedrooms: 2, price: 18000, area: 800, furnishing: "unfurnished", status: "active", trustScore: 74 },
    { listingType: "rent", propertyType: "villa", bedrooms: 4, price: 65000, area: 3000, furnishing: "fully-furnished", status: "active", isFeatured: true, trustScore: 91 },
    { listingType: "rent", propertyType: "apartment", bedrooms: 2, price: 25000, area: 1000, furnishing: "semi-furnished", status: "active", trustScore: 77 },
    // PG listings
    { listingType: "pg", propertyType: "pg", price: 7000, area: 120, furnishing: "fully-furnished", status: "active", trustScore: 62 },
    { listingType: "pg", propertyType: "pg", price: 9500, area: 150, furnishing: "fully-furnished", status: "active", isFeatured: true, trustScore: 73 },
    { listingType: "pg", propertyType: "pg", price: 6000, area: 100, furnishing: "semi-furnished", status: "active", trustScore: 55 },
    // Inactive / pending
    { listingType: "buy", propertyType: "apartment", bedrooms: 2, price: 4200000, area: 900, status: "inactive", trustScore: 50 },
    { listingType: "rent", propertyType: "apartment", bedrooms: 1, price: 11000, area: 450, status: "pending", trustScore: 40 },
    // Office space
    { listingType: "rent", propertyType: "office", price: 45000, area: 800, furnishing: "fully-furnished", status: "active", trustScore: 82 },
    { listingType: "buy", propertyType: "office", price: 9500000, area: 1200, furnishing: "semi-furnished", status: "active", trustScore: 76 },
    // More variety
    { listingType: "buy", propertyType: "apartment", bedrooms: 3, price: 9200000, area: 1800, furnishing: "fully-furnished", status: "active", isFeatured: true, trustScore: 94 },
    { listingType: "rent", propertyType: "apartment", bedrooms: 2, price: 20000, area: 850, furnishing: "semi-furnished", status: "active", trustScore: 71 },
    { listingType: "buy", propertyType: "villa", bedrooms: 5, price: 45000000, area: 5000, furnishing: "fully-furnished", status: "active", isFeatured: true, trustScore: 97 },
  ];

  templates.forEach((t, i) => {
    const loc = CHANDIGARH_LOCALITIES[i % CHANDIGARH_LOCALITIES.length];
    const owner = sellers[i % sellers.length];

    props.push({
      title: `${t.bedrooms ? t.bedrooms + ' BHK ' : ''}${t.propertyType.charAt(0).toUpperCase() + t.propertyType.slice(1)} in ${loc.locality}`,
      listingType: t.listingType,
      propertyType: t.propertyType,
      price: t.price,
      address: {
        street: `${100 + i}, ${loc.locality}`,
        locality: loc.locality,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
      },
      details: {
        bedrooms: t.bedrooms || null,
        bathrooms: t.bedrooms ? Math.ceil(t.bedrooms / 2) : 1,
        area: t.area,
        floor: Math.floor(Math.random() * 10) + 1,
        totalFloors: 12,
        furnishing: t.furnishing || "unfurnished",
        constructionStatus: pick(["ready-to-move", "under-construction", "ready-to-move"]),
        facing: pick(["north", "south", "east", "west", "north-east"]),
        ageOfProperty: Math.floor(Math.random() * 10),
      },
      amenities: pickN(AMENITIES_POOL, Math.floor(Math.random() * 6) + 4),
      photos: makePhotos(t.propertyType),
      owner: owner._id,
      trustScore: t.trustScore,
      isReraVerified: t.trustScore >= 80,
      status: t.status,
      isFeatured: t.isFeatured || false,
      views: Math.floor(Math.random() * 500) + 10,
      location: {
        type: "Point",
        coordinates: [
          loc.lng + (Math.random() - 0.5) * 0.01,
          loc.lat + (Math.random() - 0.5) * 0.01,
        ],
      },
    });
  });

  return props;
}

function makeEnquiries(properties, buyers, sellers) {
  const enquiries = [];
  const messages = [
    "Hi, I am interested in this property. Can we schedule a visit?",
    "Please share more details about the floor plan and parking.",
    "Is the price negotiable? Looking for a quick deal.",
    "I would like to know about the society charges and maintenance.",
    "Can we arrange a visit this weekend?",
    "Is this property RERA registered? Please share the certificate.",
  ];

  for (let i = 0; i < 30; i++) {
    const prop = properties[i % properties.length];
    const buyer = buyers[i % buyers.length];
    enquiries.push({
      property: prop._id,
      buyer: buyer._id,
      owner: prop.owner,
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      message: messages[i % messages.length],
      enquiryType: pick(["general", "visit", "offer"]),
      status: pick(["pending", "pending", "responded", "closed"]),
      isRead: Math.random() > 0.4,
    });
  }
  return enquiries;
}

function makeLeasesAndPayments(properties, buyers) {
  const leases = [];
  const payments = [];
  
  const rentProperties = properties.filter(p => p.listingType === "rent" || p.listingType === "pg");
  
  for (let i = 0; i < Math.min(8, rentProperties.length); i++) {
    const prop = rentProperties[i];
    const tenant = buyers[i % buyers.length];
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 5));
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 11);
    
    const leaseId = new mongoose.Types.ObjectId();
    
    leases.push({
      _id: leaseId,
      property: prop._id,
      tenant: tenant._id,
      landlord: prop.owner,
      startDate,
      endDate,
      rentAmount: prop.price,
      securityDeposit: prop.price * 2,
      status: "active"
    });
    
    payments.push({
      property: prop._id,
      tenant: tenant._id,
      landlord: prop.owner,
      amount: prop.price * 2 * 100,
      paymentType: "security_deposit",
      lease: leaseId,
      razorpayOrderId: "order_sec_" + Math.random().toString(36).substring(2, 9),
      razorpayPaymentId: "pay_" + Math.random().toString(36).substring(2, 9),
      status: "paid",
    });
    
    const isPaid = Math.random() > 0.2;
    payments.push({
      property: prop._id,
      tenant: tenant._id,
      landlord: prop.owner,
      amount: prop.price * 100,
      paymentType: "rent",
      lease: leaseId,
      razorpayOrderId: "order_rnt_" + Math.random().toString(36).substring(2, 9),
      razorpayPaymentId: isPaid ? "pay_" + Math.random().toString(36).substring(2, 9) : null,
      status: isPaid ? "paid" : pick(["failed", "pending"]),
      rentMonth: new Date().getMonth() + 1,
      rentYear: new Date().getFullYear(),
    });
  }
  
  return { leases, payments };
}

function makeTenancyHubData(leases) {
  const maintenanceRecords = [];
  const reviews = [];
  
  leases.forEach((lease, index) => {
    // 1 in 2 chance to have a maintenance issue
    if (Math.random() > 0.5) {
      maintenanceRecords.push({
        property: lease.property,
        lease: lease._id,
        tenant: lease.tenant,
        landlord: lease.landlord,
        title: pick(["Leaking Faucet in Master Bath", "AC Not Cooling", "Broken Main Door Lock", "Geyser Malfunction", "Wall Paint Peeling"]),
        description: "Noticed this issue a few days ago, needs urgent fixing according to standard tenancy agreement.",
        issueType: pick(["plumbing", "electrical", "appliance", "structural", "other"]),
        priority: pick(["low", "medium", "high", "emergency"]),
        status: pick(["open", "in-progress", "resolved", "closed"])
      });
    }

    // Always generate a review between tenant and landlord
    reviews.push({
      reviewer: lease.tenant,
      reviewee: lease.landlord,
      property: lease.property,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars largely
      comment: pick(["Excellent property and very responsive landlord.", "Smooth renting experience.", "Highly recommend this broker, very transparent throughout the process.", "Property was maintained well upon move-in."]),
      status: "published"
    });
    
    // Sometimes landlord reviews tenant
    if (Math.random() > 0.4) {
       reviews.push({
          reviewer: lease.landlord,
          reviewee: lease.tenant,
          property: null, 
          rating: 5,
          comment: "Great tenant. Pays rent on time and maintains the property perfectly.",
          status: "published"
       });
    }
  });

  return { maintenanceRecords, reviews };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 NestIQ Seed Script — Starting…\n");

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in .env.local");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Register models
  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);
  const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
  const Lease = mongoose.models.Lease || mongoose.model("Lease", LeaseSchema);
  const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
  const Maintenance = mongoose.models.Maintenance || mongoose.model("Maintenance", MaintenanceSchema);
  const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

  // Wipe existing demo data
  console.log("🗑  Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Enquiry.deleteMany({}),
    Lease.deleteMany({}),
    Payment.deleteMany({}),
    Maintenance.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log("   Done.\n");

  // Create users
  console.log("👥 Creating users…");
  const createdUsers = await User.insertMany(
    USERS.map((u) => ({ ...u, passwordHash: DEMO_PASSWORD, isVerified: true }))
  );

  const adminUser = createdUsers.find((u) => u.role === "admin");
  const sellers = createdUsers.filter((u) => u.role === "seller" || u.role === "broker");
  const buyers = createdUsers.filter((u) => u.role === "buyer");
  console.log(`   ${createdUsers.length} users created.\n`);

  // Create properties
  console.log("🏠 Creating properties…");
  const propertyData = makeProperties(sellers);
  const createdProperties = await Property.insertMany(propertyData);
  console.log(`   ${createdProperties.length} properties created.\n`);

  // Create enquiries
  console.log("📩 Creating enquiries…");
  const enquiryData = makeEnquiries(createdProperties, buyers, sellers);
  const createdEnquiries = await Enquiry.insertMany(enquiryData);
  console.log(`   ${createdEnquiries.length} enquiries created.\n`);

  // Create leases and payments
  console.log("📝 Creating leases and payments…");
  const { leases, payments } = makeLeasesAndPayments(createdProperties, buyers);
  const createdLeases = await Lease.insertMany(leases);
  const createdPayments = await Payment.insertMany(payments);
  console.log(`   ${createdLeases.length} leases & ${createdPayments.length} payments created.\n`);

  // Create Tenancy Hub Data (Maintenance & Reviews)
  console.log("🛠  Creating Tenancy Hub Data…");
  const { maintenanceRecords, reviews } = makeTenancyHubData(createdLeases);
  const createdMaintenance = await Maintenance.insertMany(maintenanceRecords);
  const createdReviews = await Review.insertMany(reviews);
  console.log(`   ${createdMaintenance.length} maintenance tickets & ${createdReviews.length} reviews created.\n`);

  // Summary
  console.log("═══════════════════════════════════════");
  console.log("  🎉  NestIQ Demo Seed Complete!\n");
  console.log("  Demo Login Credentials (all same password):");
  console.log("  Password: Demo@1234\n");
  console.log("  Role          | Email");
  console.log("  ─────────────────────────────────────");
  createdUsers.forEach((u) => {
    console.log(`  ${u.role.padEnd(13)} | ${u.email}`);
  });
  console.log("\n  📊 Database Summary:");
  console.log(`     Users         : ${createdUsers.length}`);
  console.log(`     Properties    : ${createdProperties.length}`);
  console.log(`     Enquiries     : ${createdEnquiries.length}`);
  console.log(`     Leases        : ${createdLeases.length}`);
  console.log(`     Payments      : ${createdPayments.length}`);
  console.log(`     Maintenance   : ${createdMaintenance.length}`);
  console.log(`     Reviews       : ${createdReviews.length}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
