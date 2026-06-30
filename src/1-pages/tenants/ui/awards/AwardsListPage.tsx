import { getTenantByDomain } from "@/4-entities/tenant";
import { getPublishedEntities } from "@/4-entities/entity";
import { AwardsList } from "@/2-widgets/tenant/AwardsList";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import type { PageContextTypes, SupportedLocaleType } from "@/5-shared/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateAwardsListMetadata(context: PageContextTypes): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context;
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain });
  if (!tenant) return {};
  const baseUrl = `https://${domain}`;
  return {
    title: `Awards | ${tenant.name}`,
    description: `Awards and recognitions from ${tenant.name}`,
    alternates: {
      canonical: `${baseUrl}/${locale}/awards`,
      languages: Object.fromEntries(
        (tenant.locales ?? ["en"]).map((l: string) => [l, `${baseUrl}/${l}/awards`]),
      ),
    },
    robots: { index: tenant.seoEnabled !== false, follow: tenant.seoEnabled !== false },
  };
}

export async function AwardsListPage({ context }: { context: PageContextTypes }) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context;
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain });
  if (!tenant) notFound();

  const [items, navT] = await Promise.all([
    getPublishedEntities("award_item", tenant.id, locale as SupportedLocaleType, { limit: 100 }),
    getPlatformTranslations("tenant.nav", locale),
  ]);

  return (
    <AwardsList
      items={items}
      locale={locale as SupportedLocaleType}
      tenant={tenant}
      heading={resolveTranslation(navT, "awards", "Awards")}
      backLabel={resolveTranslation(navT, "back", "Back")}
      emptyLabel={resolveTranslation(navT, "empty", "Nothing here yet.")}
    />
  );
}
