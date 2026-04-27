import { GoogleGenAI } from "@google/genai";

// Initialize the API client.
// We strictly use process.env.GEMINI_API_KEY as requested.
// WARNING: In a real, public-facing production deployment, you MUST NOT expose
// your Gemini API key in client-side code. This is only acceptable for this
// controlled, teacher-facing prototype. For a real deployment, build a secure proxy
// backend (e.g. using a Node.js server) and make calls from there.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function sendMessageToGemini(
    history: { role: 'user' | 'model', parts: [{ text: string }] }[],
    newMessage: string,
    systemInstruction: string
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
