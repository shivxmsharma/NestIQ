/**
 * NestIQ full demo seed.
 *
 * Run:
 *   node scripts/seed.mjs
 *
 * This clears the database named by MONGODB_URI and creates coherent demo data
 * for listings, saved homes, enquiries, visits, leases, rent payments,
 * maintenance, chat, reviews, and admin settings.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

const { default: User } = await import("../src/lib/models/User.js");
const { default: Property } = await import("../src/lib/models/Property.js");
const { default: Enquiry } = await import("../src/lib/models/Enquiry.js");
const { default: Lease } = await import("../src/lib/models/Lease.js");
const { default: Payment } = await import("../src/lib/models/Payment.js");
const { default: Maintenance } = await import("../src/lib/models/Maintenance.js");
const { default: Review } = await import("../src/lib/models/Review.js");
const { default: Conversation } = await import("../src/lib/models/Conversation.js");
const { default: Message } = await import("../src/lib/models/Message.js");
const { default: PlatformSettings } = await import("../src/lib/models/PlatformSettings.js");

const DEMO_PASSWORD = "Demo@1234";
const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

const now = new Date();
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
const monthNumber = (date) => date.getMonth() + 1;
const publicDoc = (name) => `https://res.cloudinary.com/demo/raw/upload/nestiq/${name}.pdf`;

const users = [
  {
    key: "admin",
    name: "Arjun Sharma",
    email: "admin@nestiq.in",
    role: "admin",
    phone: "9876500001",
    trustScore: 96,
    responseTimeSLA: "< 1 hour",
  },
  {
    key: "sellerRajiv",
    name: "Rajiv Mehra",
    email: "rajiv@nestiq.in",
    role: "seller",
    phone: "9876500002",
    agencyName: "Rajiv Realty",
    trustScore: 91,
    responseTimeSLA: "< 4 hours",
  },
  {
    key: "brokerPriya",
    name: "Priya Sethi",
    email: "priya@nestiq.in",
    role: "broker",
    phone: "9876500003",
    agencyName: "Tricity Homes",
    reraId: "PBRERA-SAS81-REA0123",
    trustScore: 94,
    responseTimeSLA: "< 1 hour",
  },
  {
    key: "sellerHarinder",
    name: "Harinder Singh",
    email: "harinder@nestiq.in",
    role: "seller",
    phone: "9876500004",
    trustScore: 73,
    responseTimeSLA: "< 24 hours",
  },
  {
    key: "brokerSunita",
    name: "Sunita Batra",
    email: "sunita@nestiq.in",
    role: "broker",
    phone: "9876500005",
    agencyName: "Sunita Realtors",
    reraId: "HRERA-PKL-REA0456",
    trustScore: 88,
    responseTimeSLA: "< 4 hours",
  },
  { key: "amit", name: "Amit Verma", email: "amit@nestiq.in", role: "buyer", phone: "9876500010", trustScore: 82 },
  { key: "kavita", name: "Kavita Nair", email: "kavita@nestiq.in", role: "buyer", phone: "9876500011", trustScore: 86 },
  { key: "rohit", name: "Rohit Malhotra", email: "rohit@nestiq.in", role: "buyer", phone: "9876500012", trustScore: 77 },
  { key: "deepika", name: "Deepika Rana", email: "deepika@nestiq.in", role: "buyer", phone: "9876500013", trustScore: 89 },
  { key: "neha", name: "Neha Kapoor", email: "neha@nestiq.in", role: "buyer", phone: "9876500014", trustScore: 78 },
  { key: "vikas", name: "Vikas Anand", email: "vikas@nestiq.in", role: "buyer", phone: "9876500015", trustScore: 80, isActive: false },
];

const photos = {
  apartment: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  ],
  villa: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
  ],
  plot: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
  ],
  studio: [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
  ],
  office: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
  ],
};

const makePhotos = (set, prefix) =>
  set.map((url, index) => ({ url, publicId: `seed_${prefix}_${index + 1}` }));

const propertySeeds = [
  {
    key: "sector17Penthouse",
    owner: "brokerPriya",
    title: "Skyline 4 BHK Penthouse near Sector 17 Plaza",
    description: "High-floor penthouse with open terraces, modular kitchen, private lift lobby, and fast access to the city centre.",
    listingType: "buy",
    propertyType: "Penthouse",
    price: 24500000,
    status: "active",
    isFeatured: true,
    trustScore: 96,
    isReraVerified: true,
    reraNumber: "PBRERA-CHD-2026-0001",
    address: { street: "House 118, Madhya Marg", locality: "Sector 17", city: "Chandigarh", state: "Chandigarh", pincode: "160017" },
    details: { bedrooms: 4, bathrooms: 4, area: 2850, floor: 11, totalFloors: 12, furnishing: "Fully Furnished", constructionStatus: "Ready to Move", facing: "North-East", ageOfProperty: 3 },
    amenities: ["Lift", "Parking", "Power Backup", "Security", "CCTV", "Club House", "Garden"],
    photos: makePhotos(photos.apartment, "sector17_penthouse"),
    location: { type: "Point", coordinates: [76.7831, 30.7394] },
    localityIntelligence: { walkabilityScore: 92, nearestMetroDistance: 1.6, nearestSchoolDistance: 0.8, airQualityIndex: 71 },
    views: 841,
  },
  {
    key: "sector22Rent",
    owner: "sellerRajiv",
    title: "Sunny 2 BHK Apartment in Sector 22",
    description: "Well-kept rental home with balcony, dedicated parking, and quick access to markets and bus routes.",
    listingType: "rent",
    propertyType: "Apartment",
    price: 24000,
    status: "active",
    isFeatured: true,
    trustScore: 88,
    isReraVerified: true,
    reraNumber: "PBRERA-CHD-2025-0122",
    address: { street: "Flat 302, Rose Apartments", locality: "Sector 22", city: "Chandigarh", state: "Chandigarh", pincode: "160022" },
    details: { bedrooms: 2, bathrooms: 2, area: 1050, floor: 3, totalFloors: 8, furnishing: "Semi-Furnished", constructionStatus: "Ready to Move", facing: "East", ageOfProperty: 5 },
    amenities: ["Lift", "Parking", "Security", "Power Backup", "24x7 Water Supply"],
    photos: makePhotos(photos.apartment, "sector22_rent"),
    location: { type: "Point", coordinates: [76.7727, 30.728] },
    localityIntelligence: { walkabilityScore: 86, nearestMetroDistance: 2.1, nearestSchoolDistance: 0.6, airQualityIndex: 78 },
    views: 612,
  },
  {
    key: "mohaliPhase7Rent",
    owner: "brokerSunita",
    title: "Furnished 3 BHK near Mohali Phase 7 Market",
    description: "Move-in-ready apartment for families with gated security, gym access, and two balconies.",
    listingType: "rent",
    propertyType: "Apartment",
    price: 36000,
    status: "active",
    trustScore: 84,
    isReraVerified: true,
    reraNumber: "PBRERA-SAS81-PR0987",
    address: { street: "Tower B, Green Heights", locality: "Phase 7", city: "Mohali", state: "Punjab", pincode: "160059" },
    details: { bedrooms: 3, bathrooms: 3, area: 1620, floor: 6, totalFloors: 12, furnishing: "Fully Furnished", constructionStatus: "Ready to Move", facing: "South-East", ageOfProperty: 4 },
    amenities: ["Lift", "Parking", "Gym", "Swimming Pool", "Security", "CCTV", "Kids Play Area"],
    photos: makePhotos(photos.apartment, "phase7_rent"),
    location: { type: "Point", coordinates: [76.7179, 30.7046] },
    localityIntelligence: { walkabilityScore: 81, nearestMetroDistance: 3.4, nearestSchoolDistance: 1.1, airQualityIndex: 83 },
    views: 390,
  },
  {
    key: "aerocityVilla",
    owner: "sellerHarinder",
    title: "Independent 5 BHK Villa in Aerocity",
    description: "Corner villa with lawn, servant room, covered parking for two cars, and premium finishes.",
    listingType: "buy",
    propertyType: "Villa",
    price: 41000000,
    status: "active",
    isFeatured: true,
    trustScore: 82,
    isReraVerified: false,
    address: { street: "Plot 42, Airport Road", locality: "Aerocity", city: "Mohali", state: "Punjab", pincode: "140308" },
    details: { bedrooms: 5, bathrooms: 5, area: 4200, floor: 0, totalFloors: 2, furnishing: "Semi-Furnished", constructionStatus: "Ready to Move", facing: "North-West", ageOfProperty: 2 },
    amenities: ["Parking", "Garden", "Security", "CCTV", "Power Backup", "24x7 Water Supply"],
    photos: makePhotos(photos.villa, "aerocity_villa"),
    location: { type: "Point", coordinates: [76.7896, 30.6636] },
    localityIntelligence: { walkabilityScore: 66, nearestMetroDistance: 5.7, nearestSchoolDistance: 2.4, airQualityIndex: 88 },
    views: 721,
  },
  {
    key: "panchkulaStudioPg",
    owner: "brokerPriya",
    title: "Managed Studio PG for Women in Panchkula Sector 20",
    description: "Professionally managed PG with meals, housekeeping, biometric entry, and study-friendly common spaces.",
    listingType: "pg",
    propertyType: "Studio",
    price: 11500,
    status: "active",
    isFeatured: true,
    trustScore: 79,
    isReraVerified: false,
    address: { street: "House 214, Peer Muchalla Road", locality: "Sector 20", city: "Panchkula", state: "Haryana", pincode: "134116" },
    details: { bedrooms: 1, bathrooms: 1, area: 180, floor: 2, totalFloors: 4, furnishing: "Fully Furnished", constructionStatus: "Ready to Move", facing: "East", ageOfProperty: 6 },
    pgDetails: { genderAllowed: "female", mealsIncluded: true, occupancyType: "single" },
    amenities: ["Wi-Fi", "Security", "CCTV", "Power Backup", "24x7 Water Supply"],
    photos: makePhotos(photos.studio, "panchkula_pg"),
    location: { type: "Point", coordinates: [76.8606, 30.6942] },
    localityIntelligence: { walkabilityScore: 74, nearestMetroDistance: 4.8, nearestSchoolDistance: 1.3, airQualityIndex: 91 },
    views: 504,
  },
  {
    key: "zirakpurBuilderFloor",
    owner: "sellerRajiv",
    title: "New 3 BHK Builder Floor in Zirakpur",
    description: "Fresh builder floor with stilt parking, modular kitchen, and easy highway connectivity.",
    listingType: "buy",
    propertyType: "Builder Floor",
    price: 6800000,
    status: "active",
    trustScore: 76,
    isReraVerified: true,
    reraNumber: "PBRERA-SAS79-PR0441",
    address: { street: "Block C, VIP Road", locality: "Zirakpur", city: "Zirakpur", state: "Punjab", pincode: "140603" },
    details: { bedrooms: 3, bathrooms: 3, area: 1500, floor: 2, totalFloors: 4, furnishing: "Unfurnished", constructionStatus: "Ready to Move", facing: "South", ageOfProperty: 1 },
    amenities: ["Parking", "Security", "CCTV", "24x7 Water Supply"],
    photos: makePhotos(photos.apartment, "zirakpur_builder_floor"),
    location: { type: "Point", coordinates: [76.8205, 30.644] },
    localityIntelligence: { walkabilityScore: 70, nearestMetroDistance: 6.2, nearestSchoolDistance: 1.7, airQualityIndex: 95 },
    views: 287,
  },
  {
    key: "khararPlot",
    owner: "sellerHarinder",
    title: "Residential Plot in Kharar Growth Corridor",
    description: "Approved residential plot in a developing gated layout with wide roads and nearby schools.",
    listingType: "buy",
    propertyType: "Plot",
    price: 3700000,
    status: "active",
    trustScore: 69,
    isReraVerified: false,
    address: { street: "Plot 88, Landran Road", locality: "Kharar", city: "Kharar", state: "Punjab", pincode: "140301" },
    details: { bedrooms: 0, bathrooms: 0, area: 1350, floor: 0, totalFloors: 0, furnishing: "", constructionStatus: "", facing: "West", ageOfProperty: 0 },
    amenities: ["Security", "Garden", "24x7 Water Supply"],
    photos: makePhotos(photos.plot, "kharar_plot"),
    location: { type: "Point", coordinates: [76.6455, 30.7462] },
    localityIntelligence: { walkabilityScore: 58, nearestMetroDistance: 9.3, nearestSchoolDistance: 2.8, airQualityIndex: 89 },
    views: 153,
  },
  {
    key: "sector35Pending",
    owner: "brokerSunita",
    title: "Premium 3 BHK Apartment Pending Admin Review",
    description: "A seller-submitted listing intentionally left pending for the admin approval queue.",
    listingType: "buy",
    propertyType: "Apartment",
    price: 11800000,
    status: "pending-review",
    trustScore: 71,
    isReraVerified: true,
    reraNumber: "PBRERA-CHD-2026-0035",
    address: { street: "Flat 904, City Court", locality: "Sector 35", city: "Chandigarh", state: "Chandigarh", pincode: "160035" },
    details: { bedrooms: 3, bathrooms: 3, area: 1780, floor: 9, totalFloors: 11, furnishing: "Semi-Furnished", constructionStatus: "Ready to Move", facing: "North", ageOfProperty: 2 },
    amenities: ["Lift", "Parking", "Security", "Power Backup", "Club House"],
    photos: makePhotos(photos.apartment, "sector35_pending"),
    location: { type: "Point", coordinates: [76.756, 30.7215] },
    views: 95,
  },
  {
    key: "sector44Rented",
    owner: "sellerRajiv",
    title: "Compact 1 BHK Already Rented in Sector 44",
    description: "A completed rental listing kept for dashboard and tenancy history states.",
    listingType: "rent",
    propertyType: "Apartment",
    price: 15500,
    status: "rented",
    trustScore: 80,
    isReraVerified: false,
    address: { street: "Flat 12, Orchid Homes", locality: "Sector 44", city: "Chandigarh", state: "Chandigarh", pincode: "160044" },
    details: { bedrooms: 1, bathrooms: 1, area: 520, floor: 1, totalFloors: 4, furnishing: "Semi-Furnished", constructionStatus: "Ready to Move", facing: "East", ageOfProperty: 8 },
    amenities: ["Parking", "24x7 Water Supply", "CCTV"],
    photos: makePhotos(photos.studio, "sector44_rented"),
    location: { type: "Point", coordinates: [76.7504, 30.7148] },
    views: 210,
  },
  {
    key: "sector8Sold",
    owner: "brokerPriya",
    title: "Heritage Villa Sold in Sector 8",
    description: "A sold listing included for admin filters and owner history.",
    listingType: "buy",
    propertyType: "Independent House",
    price: 53000000,
    status: "sold",
    trustScore: 93,
    isReraVerified: true,
    reraNumber: "PBRERA-CHD-2024-0008",
    address: { street: "House 56, Inner Market Road", locality: "Sector 8", city: "Chandigarh", state: "Chandigarh", pincode: "160008" },
    details: { bedrooms: 5, bathrooms: 5, area: 5000, floor: 0, totalFloors: 2, furnishing: "Fully Furnished", constructionStatus: "Ready to Move", facing: "North-East", ageOfProperty: 12 },
    amenities: ["Parking", "Garden", "Security", "Power Backup"],
    photos: makePhotos(photos.villa, "sector8_sold"),
    location: { type: "Point", coordinates: [76.8044, 30.749] },
    views: 1044,
  },
  {
    key: "phase11Inactive",
    owner: "brokerSunita",
    title: "Inactive 2 BHK in Mohali Phase 11",
    description: "Owner paused this listing; useful for inactive listing counts and owner dashboard states.",
    listingType: "rent",
    propertyType: "Apartment",
    price: 21000,
    status: "inactive",
    trustScore: 68,
    address: { street: "Flat 203, Olive Court", locality: "Phase 11", city: "Mohali", state: "Punjab", pincode: "160062" },
    details: { bedrooms: 2, bathrooms: 2, area: 980, floor: 2, totalFloors: 6, furnishing: "Unfurnished", constructionStatus: "Ready to Move", facing: "West", ageOfProperty: 9 },
    amenities: ["Lift", "Parking", "Security"],
    photos: makePhotos(photos.apartment, "phase11_inactive"),
    location: { type: "Point", coordinates: [76.7283, 30.6944] },
    views: 88,
  },
];

async function createUsers() {
  const created = await User.insertMany(
    users.map(({ key, ...user }, index) => ({
      ...user,
      email: user.email.toLowerCase(),
      passwordHash,
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
      isVerified: true,
      isPhoneVerified: true,
      isActive: user.isActive ?? true,
      rating: {
        average: Math.min(5, Math.max(3.5, (user.trustScore || 75) / 20)),
        count: user.role === "buyer" ? 2 : 8,
      },
      lastLogin: addDays(now, -(index + 1)),
    }))
  );

  return users.reduce((acc, seed, index) => {
    acc[seed.key] = created[index];
    return acc;
  }, {});
}

async function createProperties(userMap) {
  const created = await Property.insertMany(
    propertySeeds.map(({ key, owner, ...property }, index) => ({
      ...property,
      owner: userMap[owner]._id,
      availableFrom: addDays(now, index % 3 === 0 ? 0 : index + 3),
      enquiryCount: 0,
    }))
  );

  return propertySeeds.reduce((acc, seed, index) => {
    acc[seed.key] = created[index];
    return acc;
  }, {});
}

async function createSavedProperties(userMap, propertyMap) {
  await Promise.all([
    User.findByIdAndUpdate(userMap.amit._id, {
      savedProperties: [propertyMap.sector17Penthouse._id, propertyMap.sector22Rent._id, propertyMap.panchkulaStudioPg._id],
    }),
    User.findByIdAndUpdate(userMap.kavita._id, {
      savedProperties: [propertyMap.mohaliPhase7Rent._id, propertyMap.aerocityVilla._id],
    }),
    User.findByIdAndUpdate(userMap.deepika._id, {
      savedProperties: [propertyMap.zirakpurBuilderFloor._id, propertyMap.khararPlot._id],
    }),
  ]);
}

async function createEnquiries(userMap, propertyMap) {
  const enquirySeeds = [
    ["sector22Rent", "amit", "visit", "pending", false, "Can I visit this apartment this Saturday afternoon?", null, addDays(now, 2), "4:30 PM", "requested"],
    ["mohaliPhase7Rent", "kavita", "visit", "responded", true, "Please confirm if pets are allowed before the visit.", "Pets are allowed with a refundable cleaning deposit.", addDays(now, 1), "11:00 AM", "confirmed"],
    ["aerocityVilla", "rohit", "offer", "pending", false, "I am interested and can close quickly if papers are clean.", null, null, null, null],
    ["sector17Penthouse", "deepika", "general", "responded", true, "Please share maintenance charges and society rules.", "Maintenance is Rs 8,500 per month and the society allows pets.", null, null, null],
    ["panchkulaStudioPg", "neha", "visit", "closed", true, "Need a single occupancy room from next month.", "A single occupancy room is available from the 3rd.", addDays(now, -2), "6:00 PM", "completed"],
    ["zirakpurBuilderFloor", "amit", "general", "spam", true, "Unrelated promotional enquiry for testing admin spam state.", null, null, null, null],
    ["khararPlot", "kavita", "offer", "pending", false, "Can the seller consider Rs 34 lakh all-inclusive?", null, null, null, null],
    ["sector35Pending", "rohit", "general", "pending", false, "Interested once this listing is approved.", null, null, null, null],
  ];

  const docs = enquirySeeds.map(([propertyKey, buyerKey, enquiryType, status, isRead, message, ownerResponse, visitDate, visitTime, visitStatus]) => {
    const buyer = userMap[buyerKey];
    const property = propertyMap[propertyKey];
    return {
      property: property._id,
      buyer: buyer._id,
      owner: property.owner,
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      enquiryType,
      status,
      isRead,
      message,
      ownerResponse: ownerResponse || undefined,
      visitDate: visitDate || undefined,
      visitTime: visitTime || undefined,
      visitStatus: visitStatus || undefined,
      isLeadAssigned: propertyKey === "sector35Pending",
      assignedTo: propertyKey === "sector35Pending" ? userMap.brokerSunita._id : undefined,
      notes: status === "spam" ? "Seeded to exercise the spam filter state." : undefined,
    };
  });

  const enquiries = await Enquiry.insertMany(docs);
  const counts = docs.reduce((acc, doc) => {
    const id = doc.property.toString();
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  await Promise.all(
    Object.entries(counts).map(([property, enquiryCount]) =>
      Property.findByIdAndUpdate(property, { $set: { enquiryCount } })
    )
  );

  return enquiries;
}

async function createLeases(userMap, propertyMap) {
  const activeStart = addMonths(now, -4);
  const pendingStart = addDays(now, 5);
  const expiredStart = addMonths(now, -12);
  const terminatedStart = addMonths(now, -7);

  const leaseSeeds = [
    {
      key: "amitSector22",
      property: "sector22Rent",
      tenant: "amit",
      startDate: activeStart,
      endDate: addDays(addMonths(activeStart, 10), 20),
      rentAmount: 24000,
      securityDeposit: 48000,
      status: "active",
      landlordSignedAt: addDays(activeStart, -2),
      tenantSignedAt: addDays(activeStart, -1),
      autoPayEnabled: true,
      razorpaySubscriptionId: "sub_seed_amit_sector22",
      razorpayPlanId: "plan_seed_rent_24000",
      documents: [{ name: "Signed rent agreement", url: publicDoc("lease_amit_sector22"), uploadedAt: activeStart }],
      notes: "Primary active tenant demo.",
    },
    {
      key: "kavitaPhase7",
      property: "mohaliPhase7Rent",
      tenant: "kavita",
      startDate: activeStart,
      endDate: addDays(addMonths(activeStart, 10), 15),
      rentAmount: 36000,
      securityDeposit: 72000,
      status: "active",
      landlordSignedAt: addDays(activeStart, -3),
      tenantSignedAt: addDays(activeStart, -2),
      autoPayEnabled: false,
      documents: [{ name: "Stamped agreement", url: publicDoc("lease_kavita_phase7"), uploadedAt: activeStart }],
    },
    {
      key: "deepikaPg",
      property: "panchkulaStudioPg",
      tenant: "deepika",
      startDate: activeStart,
      endDate: addDays(addMonths(activeStart, 10), 10),
      rentAmount: 11500,
      securityDeposit: 23000,
      status: "active",
      landlordSignedAt: addDays(activeStart, -2),
      tenantSignedAt: addDays(activeStart, -1),
      autoPayEnabled: true,
      razorpaySubscriptionId: "sub_seed_deepika_pg",
      razorpayPlanId: "plan_seed_rent_11500",
    },
    {
      key: "nehaPending",
      property: "phase11Inactive",
      tenant: "neha",
      startDate: pendingStart,
      endDate: addDays(addMonths(pendingStart, 10), 20),
      rentAmount: 21000,
      securityDeposit: 42000,
      status: "pending",
      landlordSignedAt: addDays(now, -1),
      notes: "Tenant still needs to sign and pay deposit.",
    },
    {
      key: "rohitExpired",
      property: "sector44Rented",
      tenant: "rohit",
      startDate: expiredStart,
      endDate: addDays(addMonths(expiredStart, 10), 25),
      rentAmount: 15500,
      securityDeposit: 31000,
      status: "expired",
      landlordSignedAt: addDays(expiredStart, -2),
      tenantSignedAt: addDays(expiredStart, -1),
    },
    {
      key: "vikasTerminated",
      property: "mohaliPhase7Rent",
      tenant: "vikas",
      startDate: terminatedStart,
      endDate: addDays(addMonths(terminatedStart, 10), 15),
      rentAmount: 33000,
      securityDeposit: 66000,
      status: "terminated",
      landlordSignedAt: addDays(terminatedStart, -2),
      tenantSignedAt: addDays(terminatedStart, -1),
      notes: "Terminated early after tenant moved cities.",
    },
  ];

  const created = await Lease.insertMany(
    leaseSeeds.map(({ key, property, tenant, ...lease }) => ({
      ...lease,
      property: propertyMap[property]._id,
      tenant: userMap[tenant]._id,
      landlord: propertyMap[property].owner,
    }))
  );

  return leaseSeeds.reduce((acc, seed, index) => {
    acc[seed.key] = created[index];
    return acc;
  }, {});
}

async function createPayments(leaseMap) {
  const docs = [];

  Object.values(leaseMap).forEach((lease, leaseIndex) => {
    docs.push({
      property: lease.property,
      tenant: lease.tenant,
      landlord: lease.landlord,
      amount: lease.securityDeposit * 100,
      paymentType: "security_deposit",
      lease: lease._id,
      razorpayOrderId: `order_seed_dep_${lease._id.toString().slice(-6)}`,
      razorpayPaymentId: lease.status === "pending" ? null : `pay_seed_dep_${lease._id.toString().slice(-6)}`,
      razorpaySignature: lease.status === "pending" ? null : `sig_seed_dep_${lease._id.toString().slice(-6)}`,
      status: lease.status === "pending" ? "created" : "paid",
      notes: lease.status === "terminated" ? "Deposit marked for manual refund during termination." : "",
      createdAt: addDays(lease.startDate, -1),
      updatedAt: addDays(lease.startDate, -1),
    });

    if (["active", "expired", "terminated"].includes(lease.status)) {
      for (let offset = 0; offset < 4; offset += 1) {
        const paidFor = addMonths(lease.startDate, offset);
        docs.push({
          property: lease.property,
          tenant: lease.tenant,
          landlord: lease.landlord,
          amount: lease.rentAmount * 100,
          paymentType: "rent",
          lease: lease._id,
          razorpayOrderId: `order_seed_rent_${leaseIndex}_${offset}`,
          razorpayPaymentId: `pay_seed_rent_${leaseIndex}_${offset}`,
          razorpaySignature: `sig_seed_rent_${leaseIndex}_${offset}`,
          status: "paid",
          rentMonth: monthNumber(paidFor),
          rentYear: paidFor.getFullYear(),
          notes: offset === 0 ? "First month rent." : "",
          createdAt: addDays(paidFor, 4),
          updatedAt: addDays(paidFor, 4),
        });
      }
    }
  });

  return Payment.insertMany(docs);
}

async function createMaintenance(leaseMap) {
  const ticketSeeds = [
    {
      lease: "amitSector22",
      title: "Kitchen sink drain is leaking",
      description: "Water gathers under the kitchen sink after washing utensils.",
      issueType: "plumbing",
      priority: "high",
      status: "open",
      photos: [{ url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800" }],
    },
    {
      lease: "kavitaPhase7",
      title: "Bedroom AC cooling is weak",
      description: "The AC runs but the bedroom temperature stays high after 30 minutes.",
      issueType: "appliance",
      priority: "medium",
      status: "in-progress",
      resolutionNotes: "Technician visit scheduled.",
    },
    {
      lease: "deepikaPg",
      title: "Common area Wi-Fi router reset needed",
      description: "Internet drops repeatedly during evening hours.",
      issueType: "electrical",
      priority: "low",
      status: "resolved",
      resolutionNotes: "Router firmware updated and access point repositioned.",
    },
    {
      lease: "rohitExpired",
      title: "Move-out paint touch-up completed",
      description: "Minor wall marks recorded during move-out inspection.",
      issueType: "structural",
      priority: "medium",
      status: "closed",
      resolutionNotes: "Deducted from maintenance buffer and closed.",
    },
  ];

  return Maintenance.insertMany(
    ticketSeeds.map(({ lease: leaseKey, ...ticket }) => {
      const lease = leaseMap[leaseKey];
      return {
        ...ticket,
        lease: lease._id,
        property: lease.property,
        tenant: lease.tenant,
        landlord: lease.landlord,
      };
    })
  );
}

async function createConversations(userMap, propertyMap) {
  const conversationSeeds = [
    {
      key: "amitRajivSector22",
      property: "sector22Rent",
      buyer: "amit",
      seller: "sellerRajiv",
      messages: [
        ["amit", "Hi Rajiv, is the Sector 22 apartment still available?"],
        ["sellerRajiv", "Yes, it is available. You can visit this Saturday after 4 PM."],
        ["amit", "Great, please block 4:30 PM for me."],
      ],
      buyerUnread: 0,
      sellerUnread: 1,
    },
    {
      key: "kavitaSunitaPhase7",
      property: "mohaliPhase7Rent",
      buyer: "kavita",
      seller: "brokerSunita",
      messages: [
        ["kavita", "Is the society pet friendly?"],
        ["brokerSunita", "Yes, pets are allowed with a society registration form."],
      ],
      buyerUnread: 1,
      sellerUnread: 0,
    },
    {
      key: "rohitHarinderVilla",
      property: "aerocityVilla",
      buyer: "rohit",
      seller: "sellerHarinder",
      messages: [
        ["rohit", "Can you share the possession documents before I make an offer?"],
        ["sellerHarinder", "I can share them during the site visit and legal check."],
      ],
      buyerUnread: 0,
      sellerUnread: 0,
    },
  ];

  const conversations = [];

  for (const seed of conversationSeeds) {
    const last = seed.messages[seed.messages.length - 1];
    const conversation = await Conversation.create({
      property: propertyMap[seed.property]._id,
      buyer: userMap[seed.buyer]._id,
      seller: userMap[seed.seller]._id,
      lastMessage: last[1],
      lastMessageAt: addDays(now, -1),
      buyerUnread: seed.buyerUnread,
      sellerUnread: seed.sellerUnread,
    });

    const messages = seed.messages.map(([senderKey, text], index) => ({
      conversation: conversation._id,
      sender: userMap[senderKey]._id,
      text,
      isRead: index < seed.messages.length - 1,
      createdAt: addDays(now, -3 + index),
      updatedAt: addDays(now, -3 + index),
    }));

    await Message.insertMany(messages);
    conversations.push(conversation);
  }

  return conversations;
}

async function createReviews(userMap, propertyMap) {
  const reviews = [
    ["amit", "sellerRajiv", "sector22Rent", 5, "Responsive landlord and the handover was very smooth.", "published"],
    ["sellerRajiv", "amit", "sector22Rent", 5, "Pays on time and keeps the property in good condition.", "published"],
    ["kavita", "brokerSunita", "mohaliPhase7Rent", 4, "Transparent process and useful locality guidance.", "published"],
    ["deepika", "brokerPriya", "panchkulaStudioPg", 5, "The PG matched the listing and the move-in was quick.", "published"],
    ["rohit", "sellerHarinder", "aerocityVilla", 3, "Good property, but document sharing was slower than expected.", "flagged"],
    ["neha", "brokerSunita", null, 4, "Helpful broker for shortlisting rental homes.", "hidden"],
  ];

  return Review.insertMany(
    reviews.map(([reviewer, reviewee, property, rating, comment, status]) => ({
      reviewer: userMap[reviewer]._id,
      reviewee: userMap[reviewee]._id,
      property: property ? propertyMap[property]._id : undefined,
      rating,
      comment,
      status,
    }))
  );
}

async function createSettings() {
  return PlatformSettings.create({
    platformName: "NestIQ",
    supportEmail: "support@nestiq.in",
    maintenanceMode: false,
    autoApproveProperties: false,
    commissionFeePercentage: 2.5,
    maxPropertiesPerUser: 25,
  });
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in .env.local");
  }

  console.log("Starting NestIQ full seed...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Enquiry.deleteMany({}),
    Lease.deleteMany({}),
    Payment.deleteMany({}),
    Maintenance.deleteMany({}),
    Review.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    PlatformSettings.deleteMany({}),
  ]);

  console.log("Creating users...");
  const userMap = await createUsers();

  console.log("Creating properties...");
  const propertyMap = await createProperties(userMap);
  await createSavedProperties(userMap, propertyMap);

  console.log("Creating enquiries and visits...");
  const enquiries = await createEnquiries(userMap, propertyMap);

  console.log("Creating leases...");
  const leaseMap = await createLeases(userMap, propertyMap);

  console.log("Creating payments...");
  const payments = await createPayments(leaseMap);

  console.log("Creating maintenance tickets...");
  const maintenance = await createMaintenance(leaseMap);

  console.log("Creating conversations and messages...");
  const conversations = await createConversations(userMap, propertyMap);
  const messageCount = await Message.countDocuments();

  console.log("Creating reviews...");
  const reviews = await createReviews(userMap, propertyMap);

  console.log("Creating platform settings...");
  await createSettings();

  const summary = {
    users: Object.keys(userMap).length,
    properties: Object.keys(propertyMap).length,
    enquiries: enquiries.length,
    leases: Object.keys(leaseMap).length,
    payments: payments.length,
    maintenance: maintenance.length,
    conversations: conversations.length,
    messages: messageCount,
    reviews: reviews.length,
    platformSettings: 1,
  };

  console.log("\nNestIQ seed complete.");
  console.table(summary);
  console.log(`Demo password for every seeded user: ${DEMO_PASSWORD}`);
  console.log("Useful logins:");
  console.log("  admin@nestiq.in      admin");
  console.log("  rajiv@nestiq.in      seller with active rental");
  console.log("  priya@nestiq.in      broker with featured listings");
  console.log("  amit@nestiq.in       tenant with active lease, payments, chat, saved homes");
  console.log("  kavita@nestiq.in     tenant with active lease and visit flow");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
