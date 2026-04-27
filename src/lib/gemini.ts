import { GoogleGenerativeAI } from "@google/generative-ai";

type GeminiRole = "user" | "model";
export type GeminiHistoryItem = {
  role: GeminiRole;
  parts: Array<{ text: string }>;
};

const MODEL_NAME = "gemini-2.5-flash-exp";  // AI Studio stabil verzió

// AI Studio automatikusan injectálja a kulcsot
declare const process: {
  env: { GEMINI_API_KEY?: string; API_KEY?: string };
};
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY || "");

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function sanitizeHistory(history: GeminiHistoryItem[]): GeminiHistoryItem[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => {
      if (!item || (item.role !== "user" && item.role !== "model")) return false;
      if (!Array.isArray(item.parts)) return false;
      return item.parts.every((part) =>
        part && typeof part === "object" && typeof part.text === "string"
      );
    })
    .slice(-20);
}

export async function sendMessageToGemini(
  history: GeminiHistoryItem[],
  newMessage: string,
  systemInstruction: string
): Promise<string> {
  const cleanMessage = sanitizeText(newMessage, 8000);
  const cleanSystemInstruction = sanitizeText(systemInstruction, 12000);
  const cleanHistory = sanitizeHistory(history);

  if (!cleanMessage) {
    throw new Error("Hiányzó felhasználói üzenet.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: cleanSystemInstruction
    });
    const result = await model.generateContent(
      {
        contents: [
          ...cleanHistory,
          { role: "user", parts: [{ text: cleanMessage }] }
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048
        }
      }
    );

    const text = result.response.text()?.trim();
    if (!text) {
      throw new Error("Üres modell válasz.");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini API hiba:", error);
    throw new Error(`Gemini hiba: ${error.message}. Ellenőrizd Secrets-et.`);
  }
}
