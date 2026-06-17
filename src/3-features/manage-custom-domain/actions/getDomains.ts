"use server";

import { db } from "@/5-shared/lib/db";
import { tenantDomains } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import type { TenantDomain } from "@/5-shared/lib/db/schema";

export async function getDomains(tenantId: string): Promise<TenantDomain[]> {
  return db.select().from(tenantDomains).where(eq(tenantDomains.tenantId, tenantId));
}
