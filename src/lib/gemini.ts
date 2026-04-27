import { GoogleGenAI } from "@google/genai";

type GeminiRole = "user" | "model";

export type GeminiHistoryItem = {
  role: GeminiRole;
  parts: Array<{
    text: string;
  }>;
};

const MODEL_NAME = "gemini-2.5-flash";

declare const process: {
  env: {
    GEMINI_API_KEY?: string;
    API_KEY?: string;
  };
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "",
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
    throw new Error("Hiányzó felhasználói üzenet.");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...cleanHistory,
        {
          role: "user",
          parts: [{ text: cleanMessage }],
        },
      ],
      config: {
        systemInstruction: cleanSystemInstruction,
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Üres modellválasz.");
    }

    return text;
  } catch (error) {
    console.error("Gemini API hiba:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Ismeretlen Gemini API-hiba.";

    throw new Error(
      `Gemini hiba: ${message}. Ellenőrizd az AI Studio Secrets beállításait.`
    );
  }
}
