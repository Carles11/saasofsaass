"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces, tenantDomains, tenantDomainLogs } from "@/5-shared/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { toApexDomain, toWwwDomain, isValidDomainFormat } from "@/5-shared/lib/utils/domain";
import {
  addDomainToVercelProject,
  mapVercelErrorMessage,
} from "@/5-shared/lib/vercel/vercel-domains";
import { patchDomainToRedirect } from "@/5-shared/lib/vercel/patchDomainToRedirect";
import { requireProfile } from "@/5-shared/lib/auth/authorization";

export async function addCustomDomain(tenantId: string, domainInput: string) {
  await assertCanManageStructure(tenantId);
  const profile = await requireProfile();

  // ── 1. Validate domain ────────────────────────────────────────────────────
  if (!isValidDomainFormat(domainInput)) {
    throw new Error("settings.domain.error.invalid-format");
  }

  const apex = toApexDomain(domainInput);
  const www = toWwwDomain(apex);

  // ── 2. Check plan ─────────────────────────────────────────────────────────
  const [tenant] = await db
    .select({ workspaceId: tenants.workspaceId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Tenant not found");

  const [ws] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, tenant.workspaceId!))
    .limit(1);

  if (!ws || ws.plan !== "pro") {
    throw new Error("Custom domains are available on the Pro plan. Please upgrade.");
  }

  // ── 3. Enforce one domain per tenant ──────────────────────────────────────
  const existingDomains = await db
    .select()
    .from(tenantDomains)
    .where(
      and(
        eq(tenantDomains.tenantId, tenantId),
      ),
    );

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
    throw new Error(apexResult.error ?? "Failed to add domain to Vercel");
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
    throw new Error(
      `Failed to configure www redirect: ${wwwResult.error}`,
    );
  }

  // www already exists but needs redirect patched
  if (wwwResult.status === "already_exists") {
    await patchDomainToRedirect(www, apex);
  }

  // ── 8. Update DNS instructions from Vercel response ───────────────────────
  const dnsInstructions = apexResult.status === "added"
    ? extractDnsInstructions(apex)
    : null;

  if (dnsInstructions) {
    await db
      .update(tenantDomains)
      .set({ dnsInstructions })
      .where(eq(tenantDomains.id, row.id));
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
  const { removeDomainFromVercelProject: remove } = await import(
    "@/5-shared/lib/vercel/vercel-domains"
  );
  return remove(domain);
}

function extractDnsInstructions(_apex: string): string | null {
  // Vercel returns DNS instructions in the add response verification field
  // but we rely on getVercelDomainStatus to surface them.
  // The add response doesn't always include structured instructions,
  // so we return null here — the user will see them after clicking "Check Status".
  return null;
}
