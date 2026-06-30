import { SeoGeoForTenantsPage } from "@/1-pages/marketing/ui/SeoGeoForTenantsPage";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.seo-geo", locale);
  const title =
    t["meta.title"] ??
    "SEO & GEO Website Builder — Rank on Google & AI Search";
  const description =
    t["meta.description"] ??
    "Every site ships with per-locale metadata, hreflang, canonical URLs, sitemaps, and JSON-LD — built to rank on Google and get cited by AI answer engines.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = "/features/seo-geo-for-tenants";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
      ),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}${path}`,
      siteName: "SoSS Engine",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Page() {
  return <SeoGeoForTenantsPage />;
}
