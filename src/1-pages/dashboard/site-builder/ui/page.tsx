import { SiteBuilder } from "@/2-widgets/dashboard/SiteBuilder";
import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantById } from "@/4-entities/tenant";
import { getEntitiesByTenant } from "@/4-entities/tenant-content";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { getCurrentProfile, getTenantRole } from "@/5-shared/lib/auth/authorization";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
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

  const [blocks, entities, namespacedTranslations] = await Promise.all([
    getBlocksByTenantId(tenant.id),
    getEntitiesByTenant({ tenantId: tenant.id, locale }),
    getPlatformTranslationsByNamespaces(
      [
        "common",
        "dashboard.site-builder",
        "dashboard.blocks",
        "dashboard.collection",
        "dashboard.block-edit",
      ],
      locale,
    ),
  ]);

  const translations = {
    ...(namespacedTranslations.common ?? {}),
    ...(namespacedTranslations["dashboard.site-builder"] ?? {}),
    ...(namespacedTranslations["dashboard.blocks"] ?? {}),
    ...(namespacedTranslations["dashboard.collection"] ?? {}),
    ...(namespacedTranslations["dashboard.block-edit"] ?? {}),
  };

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <StoreHydrator tenant={tenant}>
          <SiteBuilder
            tenant={tenant}
            blocks={blocks}
            initialEntities={entities}
            userRole={role}
            translations={translations}
          />
        </StoreHydrator>
      </div>
    </main>
  );
}
