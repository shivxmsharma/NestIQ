import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import algoliasearch from "algoliasearch";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

async function syncToAlgolia() {
  if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) {
    console.warn("⚠️ Algolia keys missing in .env.local. Skipping Algolia sync.");
    return;
  }

  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.ALGOLIA_ADMIN_KEY
  );
  const index = client.initIndex("nestiq_properties");

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB. Fetching properties...");

  const Property = mongoose.connection.collection("properties");
  const properties = await Property.find({}).toArray();

  console.log(`Pumping ${properties.length} properties to Algolia...`);

  const records = properties.map((property) => {
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
      furnishing: property.details?.furnishing || "",
      constructionStatus: property.details?.constructionStatus || "",
      isReraVerified: property.isReraVerified || false,
      trustScore: property.trustScore || 70,
      coverPhoto: property.photos?.[0]?.url || "",
      amenities: property.amenities || [],
      status: property.status || "active",
      createdAt: property.createdAt ? new Date(property.createdAt).getTime() : Date.now(),
    };

    if (property.location?.coordinates?.length === 2) {
      record._geoloc = {
        lat: property.location.coordinates[1],
        lng: property.location.coordinates[0],
      };
    }
    return record;
  });

  // Replace all objects to clear old ghost data that was deleted from Mongo
  await index.replaceAllObjects(records);

  console.log("🚀 Custom Algolia Sync Complete! Updated", records.length, "objects.");
  await mongoose.disconnect();
}

syncToAlgolia().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
