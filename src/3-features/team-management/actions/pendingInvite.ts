"use server";

import { cookies } from "next/headers";
import { acceptInvitation } from "./invitations";

const COOKIE = "pending_invite";
const MAX_AGE = 60 * 60; // 1 hour — long enough to survive a sign-up + email-verify detour

/**
 * Remember an invitation token in a host-scoped cookie so it survives the
 * authentication round-trip (sign-up → email verify → return to the app domain).
 * Consumed by {@link consumePendingInvite} on the next dashboard load.
 */
export async function setPendingInvite(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
  });
}

/**
 * Materialize a remembered invitation for the now-authenticated user, then clear
 * the cookie. Returns "accepted" only when a membership was actually created, so
 * the caller knows whether to route the user to their sites.
 */
export async function consumePendingInvite(): Promise<{
  status: "none" | "accepted" | "failed";
}> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return { status: "none" };

  const res = await acceptInvitation(token);
  store.delete(COOKIE);

  return { status: res.ok ? "accepted" : "failed" };
}
