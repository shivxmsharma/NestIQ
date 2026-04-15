import { NextResponse } from "next/server";
import { ai } from "../../../../lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const { location, size, propertyType, bedrooms, condition } = body;

    if (!location || !size) {
      return NextResponse.json({ error: "Location and size are required" }, { status: 400 });
    }

    const prompt = `You are an expert real estate appraiser and market analyst in India (with special focus on Chandigarh/Punjab/Haryana region). 
    Estimate the current market valuation based ONLY on these details:
    - Location: ${location}
    - Size: ${size} sq.ft
    - Property Type: ${propertyType}
    - Bedrooms: ${bedrooms}
    - Condition: ${condition}
    
    Respond ONLY with a valid JSON object. Do not include markdown code blocks (like \`\`\`json). Just return the raw JSON object exactly with the following keys:
    {
      "estimatedRange": "e.g. ₹1.2 Cr - ₹1.5 Cr",
      "averageRatePerSqFt": "e.g. ₹8,500/sq.ft",
      "rentalYieldEstimate": "e.g. 3.5% - 4.2%",
      "marketTrendSummary": "A brief 2-sentence summary of the market trend in this location",
      "confidence": "Low | Medium | High"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    // Safety cleanup in case Gemini returns markdown block
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Valuation Error:", error);

    // Check if it is a 503 High Demand error from Gemini API
    if (error?.status === 503 || error?.message?.includes("high demand") || error?.message?.includes("UNAVAILABLE")) {
      return NextResponse.json(
        { error: "The AI model is currently experiencing high demand. Please try again in a few moments." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Failed to generate valuation. Please try again." }, { status: 500 });
  }
}
