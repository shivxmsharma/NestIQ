import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import algoliasearch from "algoliasearch";
import Property from "../src/lib/models/Property.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

function toAlgoliaRecord(property) {
  const locality = property.address?.locality || "";
  const city = property.address?.city || "";
  const beds = property.details?.bedrooms;

  const record = {
    objectID: property._id.toString(),
    title:
      property.title ||
      `${beds ? beds + " BHK " : ""}${property.propertyType} in ${locality}, ${city}`,
    listingType: property.listingType,
    propertyType: property.propertyType,
    price: property.price || 0,
    city,
    locality,
    state: property.address?.state || "",
    street: property.address?.street || "",
    bedrooms: property.details?.bedrooms || 0,
    bathrooms: property.details?.bathrooms || 0,
    area: property.details?.area || 0,
    floor: property.details?.floor || 0,
    totalFloors: property.details?.totalFloors || 0,
    furnishing: property.details?.furnishing || "",
    constructionStatus: property.details?.constructionStatus || "",
    facing: property.details?.facing || "",
    ageOfProperty: property.details?.ageOfProperty || 0,
    isReraVerified: property.isReraVerified || false,
    reraNumber: property.reraNumber || "",
    trustScore: property.trustScore || 70,
    coverPhoto: property.photos?.[0]?.url || "",
    photos: property.photos || [],
    amenities: property.amenities || [],
    status: property.status || "active",
    isFeatured: property.isFeatured || false,
    views: property.views || 0,
    enquiryCount: property.enquiryCount || 0,
    availableFrom: property.availableFrom
      ? new Date(property.availableFrom).getTime()
      : null,
    pgGenderAllowed: property.pgDetails?.genderAllowed || "",
    pgMealsIncluded: property.pgDetails?.mealsIncluded || false,
    pgOccupancyType: property.pgDetails?.occupancyType || "",
    walkabilityScore: property.localityIntelligence?.walkabilityScore || 0,
    nearestMetroDistance: property.localityIntelligence?.nearestMetroDistance || 0,
    nearestSchoolDistance: property.localityIntelligence?.nearestSchoolDistance || 0,
    airQualityIndex: property.localityIntelligence?.airQualityIndex || 0,
    createdAt: property.createdAt ? new Date(property.createdAt).getTime() : Date.now(),
  };

  if (property.location?.coordinates?.length === 2) {
    record._geoloc = {
      lat: property.location.coordinates[1],
      lng: property.location.coordinates[0],
    };
  }

  return record;
}

async function syncToAlgolia() {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) {
    console.warn("Algolia keys missing in .env.local. Skipping Algolia sync.");
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in .env.local");
  }

  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
  );
  const index = client.initIndex("nestiq_properties");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB. Fetching active properties...");

  const properties = await Property.find({ status: "active" }).lean();
  const records = properties.map(toAlgoliaRecord);

  console.log(`Syncing ${records.length} public properties to Algolia...`);

  await index.replaceAllObjects(records);

  console.log("Algolia sync complete. Updated", records.length, "objects.");
  await mongoose.disconnect();
}

syncToAlgolia().catch(async (err) => {
  console.error("Sync failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
