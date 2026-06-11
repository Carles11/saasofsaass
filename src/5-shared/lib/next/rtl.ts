/** RTL locale detection for text direction in edit forms.
 * Current supported locales (en, es, ca, fr, de, it, eu, ga) are all LTR.
 * Extend RTL_LOCALES when adding Arabic, Hebrew, Farsi, Urdu, etc.
 */
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale)
}
