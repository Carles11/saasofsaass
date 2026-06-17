"use server";

import { db } from "@/5-shared/lib/db";
import { tenantDomains, workspaces } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import type { TenantDomain } from "@/5-shared/lib/db/schema";

export async function getCustomDomainSettings(tenantId: string, workspaceId: string): Promise<{
  domainRows: TenantDomain[];
  plan: string;
}> {
  const [domainRows, ws] = await Promise.all([
    db
      .select()
      .from(tenantDomains)
      .where(eq(tenantDomains.tenantId, tenantId)),
    workspaceId
      ? db.select({ plan: workspaces.plan }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1).then(r => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  return {
    domainRows,
    plan: ws?.plan ?? "free",
  };
}
