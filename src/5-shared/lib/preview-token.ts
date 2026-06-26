import { SignJWT, jwtVerify } from "jose";

const secret = () => {
  const raw = process.env.PREVIEW_TOKEN_SECRET;
  if (!raw) throw new Error("PREVIEW_TOKEN_SECRET env var is not set");
  return new TextEncoder().encode(raw);
};

/**
 * Signs a preview token for a draft tenant.
 * @param tenantId  The tenant's UUID.
 * @param expiresInSeconds  Seconds until expiry. Omit (or pass undefined) for a token that never expires.
 */
export async function signPreviewToken(
  tenantId: string,
  expiresInSeconds?: number,
): Promise<string> {
  const builder = new SignJWT({ tenantId }).setProtectedHeader({ alg: "HS256" });
  if (expiresInSeconds !== undefined) {
    builder.setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds);
  }
  return builder.sign(secret());
}

/**
 * Verifies a preview token. Returns the tenantId (and expiry, if any) on
 * success, null on any failure. `exp` is the standard JWT expiry in epoch
 * seconds — used to size the host-scoped preview cookie so it can never
 * outlive the token itself.
 */
export async function verifyPreviewToken(
  token: string,
): Promise<{ tenantId: string; exp?: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.tenantId !== "string") return null;
    return { tenantId: payload.tenantId, exp: payload.exp };
  } catch {
    return null;
  }
}
