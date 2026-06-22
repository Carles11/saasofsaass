/**
 * Client-safe fields metadata for the Site Builder editor.
 * IMPORTANT: This file must NEVER import block components or any server-only
 * modules (db, fs, etc.). It is imported by 'use client' components.
 */
import type { BlockKind } from "@/5-shared/types/tenants/blocks";

export type FieldDef = {
  key: string;
  label: string;
  inputType: "input" | "textarea" | "image";
};

export const blockFields: Partial<Record<BlockKind, FieldDef[]>> = {
  navbar: [{ key: "siteTitle", label: "Site Title", inputType: "input" }],
  hero: [
    { key: "title", label: "Title", inputType: "input" },
    { key: "subtitle", label: "Subtitle", inputType: "textarea" },
    { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
    { key: "heroImage", label: "Hero Image", inputType: "image" },
  ],
  contact: [
    { key: "title", label: "Title", inputType: "input" },
    { key: "description", label: "Description", inputType: "textarea" },
  ],
  "cta-banner": [
    { key: "heading", label: "Heading", inputType: "input" },
    { key: "subtitle", label: "Subtitle", inputType: "textarea" },
    { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
  ],
  "blog-feed": [],
  "text-content": [
    { key: "heading", label: "Heading", inputType: "input" },
    { key: "body", label: "Body", inputType: "textarea" },
  ],
  "image-gallery": [
    { key: "images", label: "Images", inputType: "input" }, // Placeholder for gallery manager
    { key: "lang", label: "Language", inputType: "input" },
  ],
};
