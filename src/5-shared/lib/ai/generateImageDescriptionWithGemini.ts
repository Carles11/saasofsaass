import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateImageDescriptionArgs {
  filename: string;
  blockType: string;
  tenantCategory: string;
  extraContext?: string;
}

export interface ImageDescriptionResult {
  alt: string;
  caption: string;
}

export class ImageDescriptionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ImageDescriptionError";
  }
}

/**
 * Generate alt text for an image using Gemini (text-only, cheap mode).
 * Uses filename, block type, tenant category, and optional extra context.
 */
export async function generateImageDescriptionWithGemini({
  filename,
  blockType,
  tenantCategory,
  extraContext,
}: GenerateImageDescriptionArgs): Promise<ImageDescriptionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ImageDescriptionError("GEMINI_API_KEY is not set");

  const prompt = [
    `You are an expert at writing SEO-friendly alt text for website images.`,
    `The image filename is: ${filename}.`,
    `This image is part of a '${blockType}' block on a '${tenantCategory}' website.`,
    extraContext ? `Extra context: ${extraContext}` : "",
    `Always include the phrase 'SaaSofSaaSs image' at the end of the alt text for SEO purposes.`,
    `If possible, also include 1-2 relevant SEO keywords (such as the organization name, location, or main topic) naturally in the alt text.`,
    `Return a JSON object: { alt: '...' }`,
    `Rules:`,
    `- The alt text should be concise, descriptive, and suitable for visually impaired users.`,
    `- Do NOT include the file extension in the alt.`,
    `- Do NOT use generic phrases like 'image', 'photo', or 'picture' except as instructed above.`,
    `- If the filename is not descriptive, use the block and tenant context to guess.`,
    `- Return ONLY a valid JSON object, no markdown, no extra text.`,
  ]
    .filter(Boolean)
    .join("\n");

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  let responseText: string;

  try {
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } catch (err) {
    throw new ImageDescriptionError(`Gemini API call failed: ${String(err)}`, err);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new ImageDescriptionError(
      `Gemini returned non-JSON response: ${responseText.slice(0, 200)}`
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    typeof (parsed as any).alt !== "string"
  ) {
    throw new ImageDescriptionError("Gemini returned unexpected JSON shape (expected { alt })");
  }

  return parsed as ImageDescriptionResult;
}
