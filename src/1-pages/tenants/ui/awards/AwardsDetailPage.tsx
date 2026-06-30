import { getTenantByDomain } from "@/4-entities/tenant";
import { getEntityBySlug } from "@/4-entities/entity";
import { AwardsDetail } from "@/2-widgets/tenant/AwardsList";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import type { PageContextTypes, SupportedLocaleType } from "@/5-shared/types";
import type { AwardItemPayload } from "@/5-shared/types/tenants/entities";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface AwardsDetailParams {
  context: PageContextTypes;
  slug: string;
}

export async function generateAwardsDetailMetadata({ context, slug }: AwardsDetailParams): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context;
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain });
  if (!tenant) return {};
  const row = await getEntityBySlug("award_item", tenant.id, slug, locale as SupportedLocaleType);
  if (!row) return {};
  const payload = row.translation?.payload as AwardItemPayload | null;
  const title = payload?.title ?? row.entity.slug ?? slug;
  const baseUrl = `https://${domain}`;
  return {
    title: `${title} | Awards | ${tenant.name}`,
    alternates: { canonical: `${baseUrl}/${locale}/awards/${slug}` },
    openGraph: {
      title: `${title} | ${tenant.name}`,
      url: `${baseUrl}/${locale}/awards/${slug}`,
      ...(row.entity.coverImageUrl ? { images: [{ url: row.entity.coverImageUrl }] } : {}),
    },
    robots: { index: tenant.seoEnabled !== false, follow: tenant.seoEnabled !== false },
  };
}

export async function AwardsDetailPage({ context, slug }: AwardsDetailParams) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context;
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain });
  if (!tenant) notFound();

  const row = await getEntityBySlug("award_item", tenant.id, slug, locale as SupportedLocaleType);
  if (!row) notFound();

  const navT = await getPlatformTranslations("tenant.nav", locale);

  return (
    <AwardsDetail
      data={row}
      locale={locale as SupportedLocaleType}
      tenant={tenant}
      backLabel={resolveTranslation(navT, "back-to-awards", "Back to awards")}
    />
  );
}
