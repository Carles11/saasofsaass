"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenantDomains, tenantDomainLogs } from "@/5-shared/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { toApexDomain } from "@/5-shared/lib/utils/domain";
import { encodeDnsColumn } from "@/5-shared/lib/utils/dnsRecords";
import { getVercelDomainStatus } from "@/5-shared/lib/vercel/vercel-domains";
import { requireProfile } from "@/5-shared/lib/auth/authorization";

export async function verifyCustomDomain(tenantId: string, domain: string) {
  await assertCanManageStructure(tenantId);
  const profile = await requireProfile();

  const apex = toApexDomain(domain);

  const vercelStatus = await getVercelDomainStatus(apex);

  // Map Vercel status to our status
  const resolvedStatus = mapVercelStatus(vercelStatus.status);

  // Update the DB row
  await db
    .update(tenantDomains)
    .set({
      status: resolvedStatus,
      dnsInstructions: encodeDnsColumn(
        vercelStatus.dnsInstructions,
        vercelStatus.dnsRecords,
      ),
      lastError: vercelStatus.error ?? null,
    })
    .where(
      and(
        eq(tenantDomains.tenantId, tenantId),
        eq(tenantDomains.domain, apex),
      ),
    );

  // Audit log (non-fatal)
  try {
    await db.insert(tenantDomainLogs).values({
      tenantId,
      profileId: profile.id,
      newDomain: apex,
      event: "verify",
    });
  } catch {
    // non-fatal
  }

  revalidatePath("/", "layout");

  return {
    domain: apex,
    status: resolvedStatus,
    dnsInstructions: vercelStatus.dnsInstructions ?? null,
    error: vercelStatus.error ?? null,
  };
}

function mapVercelStatus(
  vercelStatus: "valid" | "pending_validation" | "pending_certificate" | "error",
): "pending" | "pending_certificate" | "verified" | "error" {
  switch (vercelStatus) {
    case "valid":
      return "verified";
    case "pending_validation":
      return "pending";
    case "pending_certificate":
      return "pending_certificate";
    case "error":
      return "error";
  }
}
