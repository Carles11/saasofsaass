export interface FontOption {
  id: string;
  name: string;
  variable: string;
  category: string;
}

/**
 * Inter is loaded in layout.tsx as variable '--font-sans'.
 * All other fonts are loaded via fontLoader.ts.
 */
export const AVAILABLE_TITLE_FONTS: FontOption[] = [
  { id: "playfair", name: "Playfair Display", variable: "--font-playfair-display", category: "Serif" },
  { id: "cormorant", name: "Cormorant Garamond", variable: "--font-cormorant-garamond", category: "Serif" },
  { id: "montserrat", name: "Montserrat", variable: "--font-montserrat", category: "Sans-serif" },
  { id: "cinzel", name: "Cinzel", variable: "--font-cinzel", category: "Elegant" },
  { id: "dm-serif", name: "DM Serif Display", variable: "--font-dm-serif-display", category: "Serif" },
];

export const AVAILABLE_BODY_FONTS: FontOption[] = [
  { id: "inter", name: "Inter", variable: "--font-sans", category: "Modern" },
  { id: "plus-jakarta", name: "Plus Jakarta Sans", variable: "--font-plus-jakarta-sans", category: "Modern" },
  { id: "lato", name: "Lato", variable: "--font-lato", category: "Clean" },
  { id: "source-sans", name: "Source Sans 3", variable: "--font-source-sans-3", category: "Readable" },
];

export const DEFAULT_FONTS = {
  title: "playfair",
  body: "inter",
} as const;

const allFonts = [...AVAILABLE_TITLE_FONTS, ...AVAILABLE_BODY_FONTS];
const fontMap = new Map(allFonts.map((f) => [f.id, f]));

export function getFontById(id: string): FontOption | undefined {
  return fontMap.get(id);
}

export function getFontVariable(id: string): string | undefined {
  return fontMap.get(id)?.variable;
}

export function isValidFontId(id: string, pool: FontOption[]): boolean {
  return pool.some((f) => f.id === id);
}

/**
 * Reverse-lookup: given a stored branding value like "var(--font-playfair-display)",
 * return the font ID ("playfair"). Returns undefined if not found.
 */
export function getFontIdByVariableRef(ref: string): string | undefined {
  // ref is like "var(--font-playfair-display)"
  const varName = ref.replace(/^var\(/, "").replace(/\)$/, "");
  for (const f of allFonts) {
    if (f.variable === varName) return f.id;
  }
  return undefined;
}
