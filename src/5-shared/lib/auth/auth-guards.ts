import { redirect } from "next/navigation";
import { getSession } from "./authorization";

/**
 * Bounce already-authenticated users away from auth *entry* pages
 * (sign-in / sign-up / forgot-password) straight to the dashboard.
 *
 * Call this from those pages only — never from reset-password, which is reached
 * via an emailed token link and must stay reachable even when a session exists.
 *
 * Must be called on the app host (after the host check), since the auth session
 * cookie is scoped to the app domain.
 */
export async function redirectIfAuthenticated(locale: string): Promise<void> {
  let session = null;
  try {
    session = await getSession();
  } catch {
    // No / invalid session — let the auth page render.
    return;
  }

  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }
}
