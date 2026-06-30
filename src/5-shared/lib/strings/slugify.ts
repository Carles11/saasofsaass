/**
 * Convert an arbitrary title into a URL-safe slug.
 * - lowercases, strips diacritics, replaces non-alphanumerics with hyphens
 * - collapses repeats, trims leading/trailing hyphens
 * Returns "" for empty/garbage input (caller should fall back).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

/**
 * Given a desired base slug and a set of slugs already taken (for the same
 * tenant), return a unique slug by appending -2, -3, … when needed.
 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "item";
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/**
 * Strip HTML tags to plain text — for card/preview clamps where rich-text
 * content shouldn't render its markup. Collapses whitespace.
 */
export function htmlToText(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
