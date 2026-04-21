import { db } from "@/5-shared/lib/db";
import { tenantDomains, tenants } from "@/5-shared/lib/db/schema";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { eq } from "drizzle-orm";

/**
 * SERVER COMPONENT: Tenant Layout
 * * This layout fetches the tenant data from Neon using the domain param.
 * It hydrates the Zustand store via StoreHydrator to ensure all nested
 * client components have instant access to the "Bentley" context.
 */
export default async function TenantLayout({
  params,
  children,
}: {
  params: Promise<{ domain: string }>;
  children: React.ReactNode;
}) {
  // Next.js 15: params must be awaited
  const { domain } = await params;

  // Fetch tenant by joining tenant_domains for domain match
  const result = await db
    .select()
    .from(tenants)
    .innerJoin(tenantDomains, eq(tenantDomains.domain, domain))
    .where(eq(tenantDomains.domain, domain));
  const tenant = result?.[0]?.tenants ?? null;
  // If no tenant found, we fall back to null (StoreHydrator handles this)
  return (
    <StoreHydrator tenant={tenant ?? null}>
      {/* <TenantHeader /> */}
      <div className="min-h-screen selection:bg-zinc-900 selection:text-white">{children}</div>
    </StoreHydrator>
  );
}
