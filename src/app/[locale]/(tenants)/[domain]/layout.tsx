import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { TenantHeader } from "@/2-widgets/tenant/header/tenantHeader";

/**
 * SERVER COMPONENT: Tenant Layout
 * * This layout fetches the tenant data from Neon using the domain param.
 * It hydrates the Zustand store via StoreHydrator to ensure all nested 
 * client components have instant access to the "Bentley" context.
 */
export default async function TenantLayout({ 
  params, 
  children 
}: { 
  params: Promise<{ domain: string }>, 
  children: React.ReactNode 
}) {
  // Next.js 15: params must be awaited
  const { domain } = await params;
  
  // Fetch tenant from Neon DB
  // We use the first result from the domain match
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.domain, domain)
  });

  // If no tenant found, we fall back to null (StoreHydrator handles this)
  return (
    <StoreHydrator tenant={tenant ?? null}>
                <TenantHeader />

       <div className="min-h-screen selection:bg-zinc-900 selection:text-white">
         {children}
       </div>
    </StoreHydrator>
  );
}