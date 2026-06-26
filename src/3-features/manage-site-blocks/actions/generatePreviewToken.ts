"use server";

import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { getPlan } from "@/5-shared/lib/billing/plans";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import { signPreviewToken } from "@/5-shared/lib/preview-token";
import { eq } from "drizzle-orm";

const rootDomain = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
).toLowerCase();

const isDev = process.env.NODE_ENV === "development";
const devPort = process.env.NEXT_PUBLIC_DEV_PORT || "3000";

/**
 * Generates a signed preview URL for a draft tenant.
 *
 * @param tenantId       The tenant UUID.
 * @param expiresInDays  Days until expiry for a share link. Omit for the default
 *                       1-hour auto-preview token. Always finite — preview links
 *                       never live forever.
 */
export async function generatePreviewToken(
  tenantId: string,
  expiresInDays?: number,
): Promise<string> {
  await assertCanEditContent(tenantId);

  // Resolve workspace plan to enforce expiry limits
  const [row] = await db
    .select({ slug: tenants.slug, workspaceId: tenants.workspaceId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!row) throw new Error("Tenant not found");

  // Determine expiry seconds
  let expiresInSeconds: number;

  if (expiresInDays === undefined) {
    // Auto-preview: 1 hour, available on all plans
    expiresInSeconds = 60 * 60;
  } else {
    // Share link with a chosen duration — validate against the plan's ceiling.
    const workspacePlan = await getWorkspacePlan(row.workspaceId);
    const maxDays = getPlan(workspacePlan).features.previewLinkMaxDays;
    if (maxDays === null) throw new Error("Share Preview Link requires Pro or higher");
    if (expiresInDays < 1 || expiresInDays > maxDays) {
      throw new Error(`Your plan allows a maximum of ${maxDays} days`);
    }
    expiresInSeconds = expiresInDays * 24 * 60 * 60;
  }

  const token = await signPreviewToken(tenantId, expiresInSeconds);

  const base = isDev
    ? `http://${row.slug}.localhost:${devPort}`
    : `https://${row.slug}.${rootDomain}`;

  return `${base}?preview_token=${token}`;
}

async function getWorkspacePlan(workspaceId: string | null): Promise<string> {
  if (!workspaceId) return "free";
  const [ws] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  return ws?.plan ?? "free";
}
