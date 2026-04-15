import { NextResponse } from "next/server";
import { ai } from "../../../../lib/gemini";

const SYSTEM_CONTEXT = `You are NestIQ Assistant, an expert AI guide for the NestIQ real estate platform.
You specialize in Indian real estate — especially the Chandigarh Tricity (Chandigarh, Mohali, Panchkula, Zirakpur, Aerocity, Kharar).

You help with:
- Finding the right property based on needs and budget
- Understanding listings, prices, and property terminology
- Tricity neighborhood guides (Sector 17, 22, 35, 44, Elante corridor, Aerocity, etc.)
- Home buying/renting/PG process in India
- Home loan EMI calculations, registration charges, stamp duty
- Red flags to avoid in property deals
- RERA compliance, tenant rights, rental agreements
- Real estate investment advice in India

Rules:
- Keep answers concise and practical (3-5 sentences max unless a list helps)
- Always use ₹ for Indian Rupees
- Be friendly and professional
- If asked about a specific NestIQ listing, encourage the user to use the enquiry or chat feature
- Never make up specific property listings or prices`;

export async function POST(req) {
  try {
    const { message, history = [], propertyContext } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemMessage = SYSTEM_CONTEXT +
      (propertyContext ? `\n\nThe user is currently viewing this property:\n${propertyContext}` : "");

    const contents = [
      {
        role: "user",
        parts: [{ text: "System Context: " + systemMessage }],
      },
      {
        role: "model",
        parts: [{ text: "Hello! I'm NestIQ Assistant 🏠 I can help you navigate the property market in Chandigarh and across India. What would you like to know?" }],
      },
      ...history.map((h) => ({
        role: h.role === "model" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
    });
    const reply = result.text;

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[AI Chat Error]", err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}