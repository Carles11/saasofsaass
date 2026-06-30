import { getTenantByDomain, getTenantSeoBase } from "@/4-entities/tenant";
import { getPublishedEntities } from "@/4-entities/entity";
import { AwardsList } from "@/2-widgets/tenant/AwardsList";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import type { PageContextTypes, SupportedLocaleType } from "@/5-shared/types";
import type { AwardItemPayload } from "@/5-shared/types/tenants/entities";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateAwardsListMetadata(context: PageContextTypes): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context;
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain });
  if (!tenant) return {};
  const { baseUrl, indexable } = await getTenantSeoBase(tenant, domain);
  return {
    title: `Awards | ${tenant.name}`,
    description: `Awards and recognitions from ${tenant.name}`,
    alternates: {
      canonical: `${baseUrl}/${locale}/awards`,
      languages: Object.fromEntries(
        (tenant.locales ?? ["en"]).map((l: string) => [l, `${baseUrl}/${l}/awards`]),
      ),
    },
    robots: { index: indexable, follow: indexable },
  };
}

export async function AwardsListPage({ context }: { context: PageContextTypes }) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context;
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain });
  if (!tenant) notFound();

  const [items, navT, { baseUrl, indexable }] = await Promise.all([
    getPublishedEntities("award_item", tenant.id, locale as SupportedLocaleType, { limit: 100 }),
    getPlatformTranslations("tenant.nav", locale),
    getTenantSeoBase(tenant, domain),
  ]);

  return (
    <>
      {indexable && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: `Awards | ${tenant.name}`,
              description: `Awards and recognitions from ${tenant.name}`,
              url: `${baseUrl}/${locale}/awards`,
              mainEntity: {
                "@type": "ItemList",
                itemListElement: items.map(({ entity, translation }, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `${baseUrl}/${locale}/awards/${entity.slug}`,
                  name: (translation?.payload as AwardItemPayload | null)?.title ?? entity.slug ?? entity.id,
                })),
              },
            }),
          }}
        />
      )}
      <AwardsList
        items={items}
        locale={locale as SupportedLocaleType}
        tenant={tenant}
        heading={resolveTranslation(navT, "awards", "Awards")}
        backLabel={resolveTranslation(navT, "back", "Back")}
        emptyLabel={resolveTranslation(navT, "empty", "Nothing here yet.")}
      />
    </>
  );
}
