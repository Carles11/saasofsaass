import { GoogleGenerativeAI } from "@google/generative-ai";

const TONE = "clear, friendly, but formal and professional";

export interface TranslatePayloadArgs {
  /** The source-locale content to translate. Values must be plain strings. */
  payload: Record<string, string>;
  sourceLocale: string;
  targetLocale: string;
  /** Human-readable usage hint, e.g. "hero block title on an association website" */
  context: string;
}

export class TranslationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "TranslationError";
  }
}

export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Gemini rate limit hit — retry in ${retryAfterSeconds}s`);
    this.name = "RateLimitError";
  }
}

/**
 * Translate a payload object from sourceLocale to targetLocale using Gemini Flash 2.0.
 * Returns an object with the SAME keys but translated values.
 * Throws TranslationError on Gemini failure or invalid JSON response.
 */
export async function translatePayload({
  payload,
  sourceLocale,
  targetLocale,
  context,
}: TranslatePayloadArgs): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new TranslationError("GEMINI_API_KEY is not set");

  // Guard: if payload is empty or all values are empty strings, skip the API call
  const hasContent = Object.values(payload).some(
    (v) => typeof v === "string" && v.trim().length > 0
  );
  if (!hasContent) return payload;

  const systemInstruction = [
    `You are a professional translator for a ${TONE} website.`,
    `Context: ${context}.`,
    "Rules:",
    "  1. Translate ONLY the values in the JSON object. NEVER translate or change the keys.",
    "  2. Preserve any HTML tags, markdown symbols, or line breaks exactly as they appear in the source.",
    "  3. Preserve proper nouns, brand names, URLs, and slug-style strings as-is.",
    "  4. Return ONLY a valid JSON object — no markdown fences, no explanations, no extra text.",
  ].join("\n");

  const userPrompt = `Translate this JSON from "${sourceLocale}" to "${targetLocale}":\n${JSON.stringify(payload)}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  let responseText: string;
  try {
    const result = await model.generateContent(userPrompt);
    responseText = result.response.text();
  } catch (err) {
    // Surface 429 rate-limit errors with the retry delay included
    const errAny = err as Record<string, unknown>;
    if (errAny?.status === 429) {
      const details = errAny?.errorDetails as Array<Record<string, unknown>> | undefined;
      const retryInfo = details?.find(
        (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
      );
      const retryDelayStr = retryInfo?.["retryDelay"] as string | undefined; // e.g. "12s"
      const retrySeconds = retryDelayStr ? parseInt(retryDelayStr, 10) : 60;
      throw new RateLimitError(isNaN(retrySeconds) ? 60 : retrySeconds);
    }
    throw new TranslationError(`Gemini API call failed: ${String(err)}`, err);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new TranslationError(`Gemini returned non-JSON response: ${responseText.slice(0, 200)}`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new TranslationError("Gemini returned unexpected JSON shape (expected plain object)");
  }

  // Return only string values; fall back to source value if a key is missing or wrong type
  const result: Record<string, string> = {};
  for (const key of Object.keys(payload)) {
    const val = (parsed as Record<string, unknown>)[key];
    result[key] = typeof val === "string" ? val : (payload[key] ?? "");
  }

  return result;
}
