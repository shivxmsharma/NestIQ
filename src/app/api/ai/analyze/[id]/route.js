import { NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import Property from "../../../../../lib/models/Property";
import { generateContent } from "../../../../../lib/gemini";
import { calculateTrustScore, getTrustMeta } from "../../../../../lib/trustScore";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const property = await Property.findById(id).populate(
      "owner",
      "name phone isVerified agencyName reraId"
    );

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const trustScore = calculateTrustScore(property, property.owner);
    const trustMeta = getTrustMeta(trustScore);

    // Update stored trust score
    await Property.findByIdAndUpdate(id, { trustScore });

    const snapshot = `
Property Type: ${property.propertyType} for ${property.listingType}
Location: ${property.address?.locality || "N/A"}, ${property.address?.city || "N/A"}, ${property.address?.state || "India"}
Price: ₹${Number(property.price || 0).toLocaleString("en-IN")}
Bedrooms: ${property.details?.bedrooms || "N/A"}, Bathrooms: ${property.details?.bathrooms || "N/A"}
Area: ${property.details?.area || "N/A"} sq ft
Furnishing: ${property.details?.furnishing || "N/A"}
Construction Status: ${property.details?.constructionStatus || "N/A"}
Amenities: ${property.amenities?.join(", ") || "None listed"}
Photos: ${property.photos?.length || 0}
RERA Verified: ${property.isReraVerified ? "Yes" : "No"}
Trust Score: ${trustScore}/100 (${trustMeta.label})
Owner Verified: ${property.owner?.isVerified ? "Yes" : "No"}
`.trim();

    const prompt = `Analyze this Indian real estate listing and respond ONLY with a valid JSON object — no markdown, no explanation, no backticks.

${snapshot}

JSON format:
{
  "priceAssessment": "1-2 sentences on whether this price is reasonable for this property type and location in India",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "redFlags": [],
  "neighborhoodSummary": "1-2 sentences about this locality if you know it, otherwise say location looks standard",
  "buyerTips": "1-2 sentences of actionable advice for someone interested in this property",
  "overallVerdict": "GOOD_DEAL or FAIR or NEEDS_CAUTION"
}`;

    let raw = await generateContent(prompt);
    raw = raw.trim();

    // Strip any accidental markdown fences
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    const analysis = JSON.parse(raw);

    return NextResponse.json({ analysis, trustScore, trustMeta });
  } catch (err) {
    console.error("[AI Analyze Error]", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}