import { GoogleGenerativeAI } from '@google/generative-ai'

// Tone presets keyed by tenant.category — injected verbatim into the system prompt
const TONE_PRESETS: Record<string, string> = {
  'social-work': 'empathetic, inclusive and accessible; avoid jargon or overly formal phrasing; use language that feels warm and human',
  wedding:       'warm, romantic and celebratory; use elegant and heartfelt language',
  business:      'professional, concise and persuasive',
  law:           'formal and precise; leave legal terminology and proper nouns untranslated',
}

function getTone(category: string): string {
  return TONE_PRESETS[category] ?? 'clear, friendly and professional'
}

export interface TranslatePayloadArgs {
  /** The source-locale content to translate. Values must be plain strings. */
  payload: Record<string, string>
  sourceLocale: string
  targetLocale: string
  /** Human-readable usage hint, e.g. "hero block title on a social-work association website" */
  context: string
  /** The tenant.category value — determines tone preset */
  category: string
}

export class TranslationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'TranslationError'
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
  category,
}: TranslatePayloadArgs): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new TranslationError('GEMINI_API_KEY is not set')

  // Guard: if payload is empty or all values are empty strings, skip the API call
  const hasContent = Object.values(payload).some(v => typeof v === 'string' && v.trim().length > 0)
  if (!hasContent) return payload

  const tone = getTone(category)

  const systemInstruction = [
    `You are a professional translator for a ${tone} website.`,
    `Context: ${context}.`,
    'Rules:',
    '  1. Translate ONLY the values in the JSON object. NEVER translate or change the keys.',
    '  2. Preserve any HTML tags, markdown symbols, or line breaks exactly as they appear in the source.',
    '  3. Preserve proper nouns, brand names, URLs, and slug-style strings as-is.',
    '  4. Return ONLY a valid JSON object — no markdown fences, no explanations, no extra text.',
  ].join('\n')

  const userPrompt = `Translate this JSON from "${sourceLocale}" to "${targetLocale}":\n${JSON.stringify(payload)}`

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  let responseText: string
  try {
    const result = await model.generateContent(userPrompt)
    responseText = result.response.text()
  } catch (err) {
    throw new TranslationError(`Gemini API call failed: ${String(err)}`, err)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw new TranslationError(
      `Gemini returned non-JSON response: ${responseText.slice(0, 200)}`,
    )
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new TranslationError('Gemini returned unexpected JSON shape (expected plain object)')
  }

  // Return only string values; fall back to source value if a key is missing or wrong type
  const result: Record<string, string> = {}
  for (const key of Object.keys(payload)) {
    const val = (parsed as Record<string, unknown>)[key]
    result[key] = typeof val === 'string' ? val : (payload[key] ?? '')
  }

  return result
}
