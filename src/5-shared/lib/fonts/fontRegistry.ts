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
  { id: "lora", name: "Lora", variable: "--font-lora", category: "Serif" },
  { id: "libre-baskerville", name: "Libre Baskerville", variable: "--font-libre-baskerville", category: "Serif" },
  { id: "eb-garamond", name: "EB Garamond", variable: "--font-eb-garamond", category: "Serif" },
  { id: "spectral", name: "Spectral", variable: "--font-spectral", category: "Serif" },
  { id: "dm-serif", name: "DM Serif Display", variable: "--font-dm-serif-display", category: "Display" },
  { id: "fraunces", name: "Fraunces", variable: "--font-fraunces", category: "Display" },
  { id: "bodoni", name: "Bodoni Moda", variable: "--font-bodoni-moda", category: "Elegant" },
  { id: "cinzel", name: "Cinzel", variable: "--font-cinzel", category: "Elegant" },
  { id: "montserrat", name: "Montserrat", variable: "--font-montserrat", category: "Sans-serif" },
];

export const AVAILABLE_BODY_FONTS: FontOption[] = [
  { id: "inter", name: "Inter", variable: "--font-sans", category: "Modern" },
  { id: "plus-jakarta", name: "Plus Jakarta Sans", variable: "--font-plus-jakarta-sans", category: "Modern" },
  { id: "manrope", name: "Manrope", variable: "--font-manrope", category: "Modern" },
  { id: "work-sans", name: "Work Sans", variable: "--font-work-sans", category: "Modern" },
  { id: "rubik", name: "Rubik", variable: "--font-rubik", category: "Modern" },
  { id: "lato", name: "Lato", variable: "--font-lato", category: "Clean" },
  { id: "karla", name: "Karla", variable: "--font-karla", category: "Clean" },
  { id: "mulish", name: "Mulish", variable: "--font-mulish", category: "Clean" },
  { id: "source-sans", name: "Source Sans 3", variable: "--font-source-sans-3", category: "Readable" },
  { id: "nunito-sans", name: "Nunito Sans", variable: "--font-nunito-sans", category: "Readable" },
  { id: "ibm-plex", name: "IBM Plex Sans", variable: "--font-ibm-plex-sans", category: "Readable" },
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
