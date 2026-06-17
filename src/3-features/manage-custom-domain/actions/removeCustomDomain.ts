"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenantDomains, tenantDomainLogs } from "@/5-shared/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { toApexDomain, toWwwDomain } from "@/5-shared/lib/utils/domain";
import {
  removeDomainFromVercelProject,
  updateVercelProjectDomain,
} from "@/5-shared/lib/vercel/vercel-domains";
import { requireProfile } from "@/5-shared/lib/auth/authorization";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function removeCustomDomain(tenantId: string, domain: string) {
  await assertCanManageStructure(tenantId);
  const profile = await requireProfile();

  const apex = toApexDomain(domain);
  const www = toWwwDomain(apex);

  // ── 1. Delete from DB first ───────────────────────────────────────────────
  await db
    .delete(tenantDomains)
    .where(
      and(
        eq(tenantDomains.tenantId, tenantId),
        eq(tenantDomains.domain, apex),
      ),
    );

  // ── 2. Vercel cleanup — clear www redirect first, then remove both ────────
  // PATCH www to remove redirect
  await updateVercelProjectDomain(www, {
    redirect: "",
    redirectStatusCode: 308,
  });
  await delay(1000);

  // DELETE www (not_found = success)
  const wwwRemove = await removeDomainFromVercelProject(www);
  if (wwwRemove.status !== "not_found" && wwwRemove.status !== "deleted") {
    // Non-fatal — log but don't block
    console.error("Failed to remove www domain from Vercel:", wwwRemove.error);
  }
  await delay(500);

  // DELETE apex (not_found = success)
  const apexRemove = await removeDomainFromVercelProject(apex);
  if (apexRemove.status !== "not_found" && apexRemove.status !== "deleted") {
    console.error("Failed to remove apex domain from Vercel:", apexRemove.error);
  }

  // ── 3. Audit log (non-fatal) ──────────────────────────────────────────────
  try {
    await db.insert(tenantDomainLogs).values({
      tenantId,
      profileId: profile.id,
      oldDomain: apex,
      event: "remove",
    });
  } catch {
    // non-fatal
  }

  revalidatePath("/", "layout");
  return { success: true };
}
