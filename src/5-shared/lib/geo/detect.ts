import "server-only";
import { headers } from "next/headers";

const COUNTRY_HEADER = "x-vercel-ip-country";

export async function detectCountry(override?: string | null): Promise<string | null> {
  if (override) return override;

  try {
    const h = await headers();
    return h.get(COUNTRY_HEADER) ?? null;
  } catch {
    return null;
  }
}
