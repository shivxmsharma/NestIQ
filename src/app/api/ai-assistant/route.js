import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import connectDB from "../../../lib/db";
import Property from "../../../lib/models/Property";

// Optional: you can maintain chat history or context using system instructions
const ai = new GoogleGenAI({});

export async function POST(req) {
  try {
    await connectDB();

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Extract user question (the last message)
    const userQuestion = messages[messages.length - 1].text;

    // Optional: Fetch some properties if the user is asking about them. 
    // We can do a rudimentary semantic or keyword search, or just pass a summary of top listings to the AI.
    // For a generic real estate assistant, we'll give it a system prompt.

    // Convert history into GoogleGenAI format
    // role must be 'user' or 'model'
    const formattedHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `You are a helpful UI real estate assistant for 'NestIQ'. 
Your primary regions are Chandigarh, Punjab, and Haryana.
Keep your answers relatively concise, professional, and helpful. 
Format your responses with Markdown if it helps readability (e.g., bullet points for properties).`;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash", // Update with available model or use default text generation
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // We can just use standard generate content if chat isn't required, but let's try standard `generateContent` with history.

    const requestContents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [{ text: userQuestion }]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: requestContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response. Please try again later." },
      { status: 500 }
    );
  }
}
