export const DEFAULT_CURRENCY = "EUR";

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // EUR
  ES: "EUR", FR: "EUR", IT: "EUR", DE: "EUR", BE: "EUR",
  LU: "EUR", IE: "EUR", MC: "EUR", AT: "EUR",
  // Configured non-EUR currencies (live in Stripe currency_options)
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", CH: "CHF",
  MX: "MXN", CL: "CLP",
  // USD markets / USD-fallback
  CR: "USD", UY: "USD", PA: "USD", PR: "USD", DO: "USD",
  GT: "USD", EC: "USD", SV: "USD", HN: "USD", NI: "USD",
  PY: "USD", BO: "USD", CU: "USD", VE: "USD", HT: "USD",
  SC: "USD", VU: "USD",
  // Not yet configured in Stripe — fall back to EUR base automatically
  NZ: "NZD", CO: "COP", PE: "PEN", AR: "ARS",
  // Francophone Africa — Stripe can't charge these; they fall back to EUR base
  SN: "XOF", CI: "XOF", BJ: "XOF", BF: "XOF", ML: "XOF",
  NE: "XOF", TG: "XOF", CM: "XAF", CF: "XAF", TD: "XAF",
  CG: "XAF", GA: "XAF", GQ: "XAF", CD: "CDF", GN: "GNF",
  MG: "MGA", BI: "BIF", RW: "RWF", DJ: "DJF", KM: "KMF",
};

export function countryToCurrency(countryCode: string | null): string {
  if (!countryCode) return DEFAULT_CURRENCY;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}
