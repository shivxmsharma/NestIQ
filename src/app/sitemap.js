import connectDB from "../lib/db";
import Property from "../lib/models/Property";

export default async function sitemap() {
  await connectDB();
  const baseUrl = "https://nestiq.in";

  const staticRoutes = ["", "/about", "/contact", "/properties", "/rera"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "" ? 1 : 0.8,
    })
  );

  const activeProperties = await Property.find({ status: "active" })
    .select("_id updatedAt")
    .lean();

  const dynamicRoutes = activeProperties.map((prop) => ({
    url: `${baseUrl}/properties/${prop._id.toString()}`,
    lastModified: prop.updatedAt || new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
