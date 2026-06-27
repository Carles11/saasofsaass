import { randomBytes } from "node:crypto";

/** How long a pending invitation stays valid. */
export const INVITE_EXPIRY_DAYS = 7;

/** Generate a URL-safe, single-use invitation token (192 bits of entropy). */
export function generateInviteToken(): string {
  return randomBytes(24).toString("base64url");
}

/** Expiry timestamp for a freshly created/resent invitation. */
export function getInviteExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}
