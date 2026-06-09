import { SiteBuilder } from "@/2-widgets/dashboard/SiteBuilder";
import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantById } from "@/4-entities/tenant";
import { getEntitiesByTenant } from "@/4-entities/tenant-content";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { getCurrentProfile, getTenantRole } from "@/5-shared/lib/auth/authorization";
import type { SupportedLocaleType } from "@/5-shared/types";
import { notFound } from "next/navigation";

interface SiteBuilderPageProps {
  tenantId: string;
  locale: SupportedLocaleType;
}

export async function SiteBuilderPage({ tenantId, locale }: SiteBuilderPageProps) {
  const tenant = await getTenantById(tenantId);
  if (!tenant) notFound();

  const profile = await getCurrentProfile();
  const role = profile ? await getTenantRole(tenantId, profile.id) : null;

  const [blocks, entities] = await Promise.all([
    getBlocksByTenantId(tenant.id),
    getEntitiesByTenant({ tenantId: tenant.id, locale }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <StoreHydrator tenant={tenant}>
          <SiteBuilder tenant={tenant} blocks={blocks} initialEntities={entities} userRole={role} />
        </StoreHydrator>
      </div>
    </main>
  );
}
