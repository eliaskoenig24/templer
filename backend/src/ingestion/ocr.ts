/**
 * OCR-PIPELINE
 * ============
 * Extrahiert Text aus Screenshot-Meldungen für:
 * - Automatische Kategorisierung (Fake News / Deepfake / Hassrede)
 * - Volltext-Suche über Meldungen
 * - KI-Vorsortierung (kann an Claude API übergeben werden)
 *
 * OPTIONEN (wähle je nach Anforderung):
 * A) Tesseract.js  — lokal, kostenlos, 100+ Sprachen, etwas langsamer
 * B) Google Vision — API-Kosten, sehr präzise, schnell
 * C) Claude API    — API-Kosten, versteht Kontext, kann direkt kategorisieren
 *
 * Für Phase 1 (Non-Profit): Tesseract.js
 * Für Phase 2 (Skalierung): Claude API mit Fallback auf Tesseract
 */

export interface OcrResult {
  text: string;
  confidence: number;     // 0–100
  detectedLanguage?: string;
}

// ---------------------------------------------------------------------------
// Option A: Tesseract.js (npm install tesseract.js)
// ---------------------------------------------------------------------------
/*
import Tesseract from "tesseract.js";

export async function extractText(imageBuffer: Buffer): Promise<OcrResult> {
  const { data } = await Tesseract.recognize(imageBuffer, "auto", {
    logger: () => {}, // Fortschritts-Logs unterdrücken
  });

  return {
    text:             data.text.trim(),
    confidence:       data.confidence,
    detectedLanguage: data.blocks[0]?.paragraphs[0]?.lines[0]?.words[0]?.font_name,
  };
}
*/

// ---------------------------------------------------------------------------
// Option C: Claude API — extrahiert Text UND kategorisiert in einem Schritt
// ---------------------------------------------------------------------------
/*
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function extractAndClassify(imageBuffer: Buffer): Promise<{
  text: string;
  suggestedCategory: string;
  suggestedPlatform: string;
  confidence: number;
}> {
  const base64 = imageBuffer.toString("base64");

  const response = await anthropic.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: [
        {
          type:       "image",
          source: { type: "base64", media_type: "image/jpeg", data: base64 },
        },
        {
          type: "text",
          text: `Analysiere diesen Screenshot einer Social-Media-Meldung.
Antworte NUR mit JSON (keine Erklärung):
{
  "extractedText": "<sichtbarer Text im Bild>",
  "platform": "<erkannte Plattform: Twitter, Facebook, TikTok, YouTube, WhatsApp, Telegram, Instagram, Reddit, Other>",
  "category": "<eine von: Fake News, Deepfake / AI-generated Content, Hate Speech / Incitement to Violence, Political Manipulation, Other>",
  "confidence": <0-100>
}`,
        },
      ],
    }],
  });

  const json = JSON.parse(
    (response.content[0] as { type: "text"; text: string }).text
  );
  return {
    text:              json.extractedText,
    suggestedCategory: json.category,
    suggestedPlatform: json.platform,
    confidence:        json.confidence,
  };
}
*/

// Platzhalter für Type-Exporte (bis zur Implementierung)
export type OcrEngine = "tesseract" | "claude" | "google_vision";
