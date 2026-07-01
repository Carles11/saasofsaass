"use server";

import {
  assertCanManageStructure,
  requireProfile,
} from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import {
  tenantDomainLogs,
  tenantDomains,
  tenants,
  workspaces,
} from "@/5-shared/lib/db/schema";
import { encodeDnsColumn } from "@/5-shared/lib/utils/dnsRecords";
import {
  isValidDomainFormat,
  toApexDomain,
  toWwwDomain,
} from "@/5-shared/lib/utils/domain";
import { patchDomainToRedirect } from "@/5-shared/lib/vercel/patchDomainToRedirect";
import {
  addDomainToVercelProject,
  getVercelDomainStatus,
} from "@/5-shared/lib/vercel/vercel-domains";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addCustomDomain(tenantId: string, domainInput: string) {
  await assertCanManageStructure(tenantId);
  const profile = await requireProfile();

  // ── 1. Validate domain ────────────────────────────────────────────────────
  if (!isValidDomainFormat(domainInput)) {
    throw new Error("settings.domain.error.invalid-format");
  }

  const apex = toApexDomain(domainInput);
  const www = toWwwDomain(apex);

  // ── 2. Enforce one domain per tenant ────────────────────────────────────── ──────────────────────────────────────
  const existingDomains = await db
    .select()
    .from(tenantDomains)
    .where(and(eq(tenantDomains.tenantId, tenantId)));

  const existingDifferent = existingDomains.find((d) => d.domain !== apex);
  if (existingDifferent) {
    throw new Error("settings.domain.error.already-exists");
  }

  // ── 4. Idempotent retry ────────────────────────────────────────────────────
  const existingRow = existingDomains.find((d) => d.domain === apex);
  if (existingRow) {
    // Ensure www redirect is configured
    await patchDomainToRedirect(www, apex);
    revalidatePath("/", "layout");
    return { domain: apex, status: existingRow.status };
  }

  // ── 5. Upsert pending row BEFORE Vercel call (UX-first) ────────────────────
  const [row] = await db
    .insert(tenantDomains)
    .values({
      tenantId,
      domain: apex,
      status: "pending",
      isPrimary: true,
    })
    .returning();

  // ── 6. Add apex to Vercel ─────────────────────────────────────────────────
  const apexResult = await addDomainToVercelProject(apex);
  if (apexResult.status === "error") {
    await db
      .update(tenantDomains)
      .set({ status: "error", lastError: apexResult.error ?? "Vercel error" })
      .where(eq(tenantDomains.id, row.id));
    throw new Error(apexResult.error ?? "errors.vercel-add-domain-failed");
  }

  // ── 7. Add www redirect to Vercel ─────────────────────────────────────────
  const wwwResult = await addDomainToVercelProject(www, {
    redirect: apex,
    redirectStatusCode: 308,
  });

  if (wwwResult.status === "error") {
    // Rollback: remove apex from Vercel, restore DB state
    await removeDomainFromVercelProject(apex);
    await db
      .update(tenantDomains)
      .set({ status: "error", lastError: wwwResult.error ?? "Vercel error" })
      .where(eq(tenantDomains.id, row.id));
    throw new Error("errors.vercel-www-redirect-failed");
  }

  // www already exists but needs redirect patched
  if (wwwResult.status === "already_exists") {
    await patchDomainToRedirect(www, apex);
  }

  // ── 8. Merge DNS instructions from POST responses (most accurate, project-specific) ─
  const postRecords = [
    ...(apexResult.dnsRecords ?? []),
    ...(wwwResult.dnsRecords ?? []),
  ];

  // Deduplicate by type+name (e.g., an apex A and www CNAME are both valid)
  const seen = new Set<string>();
  const uniqueRecords: { type: string; name: string; value: string }[] = [];
  for (const r of postRecords) {
    const key = `${r.type}:${r.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRecords.push(r);
    }
  }

  const postInstructions = [
    apexResult.dnsInstructions,
    wwwResult.dnsInstructions,
  ]
    .filter(Boolean)
    .join("\n");

  const dnsData =
    uniqueRecords.length > 0
      ? encodeDnsColumn(postInstructions, uniqueRecords)
      : null;

  if (dnsData) {
    await db
      .update(tenantDomains)
      .set({ dnsInstructions: dnsData })
      .where(eq(tenantDomains.id, row.id));
  } else {
    // Fallback: GET API (queries both apex & www, synthesises standard values)
    try {
      const status = await getVercelDomainStatus(apex);
      const fallbackData = encodeDnsColumn(
        status.dnsInstructions,
        status.dnsRecords,
      );
      await db
        .update(tenantDomains)
        .set({ dnsInstructions: fallbackData })
        .where(eq(tenantDomains.id, row.id));
    } catch {
      // Non-fatal — user can still click Check Status to populate instructions
    }
  }

  // ── 9. Audit log (non-fatal) ──────────────────────────────────────────────
  try {
    await db.insert(tenantDomainLogs).values({
      tenantId,
      profileId: profile.id,
      newDomain: apex,
      event: "add",
    });
  } catch {
    // Logging failure should never block the response
  }

  revalidatePath("/", "layout");
  return { domain: apex, status: "pending" };
}

async function removeDomainFromVercelProject(domain: string) {
  const { removeDomainFromVercelProject: remove } =
    await import("@/5-shared/lib/vercel/vercel-domains");
  return remove(domain);
}
