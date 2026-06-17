import { SiteBuilder } from "@/2-widgets/dashboard/SiteBuilder";
import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantById } from "@/4-entities/tenant";
import { getEntitiesByTenant } from "@/4-entities/tenant-content";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { getCurrentProfile, getTenantRole } from "@/5-shared/lib/auth/authorization";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { tenantDomains, workspaces } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/5-shared/lib/db";
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

  const [blocks, entities, namespacedTranslations, domainRows, workspace] = await Promise.all([
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
    db.select().from(tenantDomains).where(eq(tenantDomains.tenantId, tenant.id)),
    tenant.workspaceId
      ? db
          .select({ plan: workspaces.plan })
          .from(workspaces)
          .where(eq(workspaces.id, tenant.workspaceId))
          .limit(1)
          .then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  const plan = workspace?.plan ?? "free";

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
            domainRows={domainRows}
            plan={plan}
          />
        </StoreHydrator>
      </div>
    </main>
  );
}
