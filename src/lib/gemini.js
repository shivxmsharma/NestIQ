import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({});

export async function generateContent(prompt, model = "gemini-3-flash-preview") {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}