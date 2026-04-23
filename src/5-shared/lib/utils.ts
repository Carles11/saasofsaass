/**
 * Generates an SEO-optimized image file name from provided context.
 * Example: "Modern Office Desk - SaaS Company" => "modern-office-desk-saas-company.webp"
 */
export function generateSeoImageName({
  title,
  blockType,
  tenantCategory,
  tenantName,
  ext = "webp",
  maxLength = 80,
}: {
  title?: string;
  blockType?: string;
  tenantCategory?: string;
  tenantName?: string;
  ext?: string;
  maxLength?: number;
}): string {
  // Combine fields, filter out empty, join with dash
  let base = [title, blockType, tenantCategory, tenantName].filter(Boolean).join(" - ");
  // Lowercase, replace non-alphanum with dash, collapse dashes, trim
  base = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  // Truncate to maxLength
  if (base.length > maxLength) base = base.slice(0, maxLength);
  // Ensure not empty
  if (!base) base = "image";
  return `${base}.${ext}`;
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
