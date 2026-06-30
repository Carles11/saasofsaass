/**
 * Sentinel prefix encoded into thrown Error messages so client components can
 * detect the cap-reached path reliably (server-action throws don't preserve
 * class identity across the network boundary — only `.message` survives).
 * Format: `PUBLISH_CAP_REACHED:{plan}:{limit}:{addonSites}: {human message}`.
 */
export const PUBLISH_CAP_SENTINEL = "PUBLISH_CAP_REACHED";

export interface PublishCapInfo {
  plan: string;
  limit: number;
  addonSites: number;
  message: string;
}

/** Parse a thrown error to detect & extract publish-cap info. Returns null
 * when the error is something else. Safe to call from client components. */
export function parsePublishCapError(err: unknown): PublishCapInfo | null {
  const message = err instanceof Error ? err.message : String(err);
  if (!message.startsWith(`${PUBLISH_CAP_SENTINEL}:`)) return null;
  const [, plan, limitStr, addonStr, ...rest] = message.split(":");
  const limit = Number(limitStr);
  const addonSites = Number(addonStr);
  if (!plan || Number.isNaN(limit) || Number.isNaN(addonSites)) return null;
  return {
    plan,
    limit,
    addonSites,
    message: rest.join(":").trim(),
  };
}
