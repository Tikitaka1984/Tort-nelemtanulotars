import { GoogleGenAI } from "@google/genai";

type GeminiRole = "user" | "model";

export type GeminiHistoryItem = {
  role: GeminiRole;
  parts: Array<{
    text: string;
  }>;
};

const MODEL_NAME = "gemini-3-flash-preview";

/**
 * Google AI Studio-kompatibilis Gemini kliens.
 *
 * Fontos:
 * - Ne írj valódi API-kulcsot ebbe a fájlba.
 * - Google AI Studio Build módban a GEMINI_API_KEY kezelése automatikus.
 */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
}

function sanitizeHistory(history: GeminiHistoryItem[]): GeminiHistoryItem[] {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => {
      if (!item) return false;
      if (item.role !== "user" && item.role !== "model") return false;
      if (!Array.isArray(item.parts)) return false;

      return item.parts.every(
        (part) =>
          part &&
          typeof part === "object" &&
          typeof part.text === "string"
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
    throw new Error("Hiányzik a felhasználói üzenet.");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...cleanHistory,
        {
          role: "user",
          parts: [
            {
              text: cleanMessage,
            },
          ],
        },
      ],
      config: {
        systemInstruction: cleanSystemInstruction,
        temperature: 0.6,
      },
    });

    const text = response.text;

    if (!text || !text.trim()) {
      throw new Error("A Gemini nem adott vissza értelmezhető választ.");
    }

    return text;
  } catch (error) {
    console.error("Gemini API hiba:", error);

    throw new Error(
      "Hiba történt a Gemini válaszgenerálás közben. Ellenőrizd az API-kulcsot, a modellt és az AI Studio beállításait."
    );
  }
}
