import { PricingPage } from "@/1-pages/marketing";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { routing } from "@/5-shared/lib/i18n/routing";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.pricing", locale);
  const title =
    t["meta.title"] ?? "Pricing — SoSS Engine | Plans for professionals & agencies";
  const description =
    t["meta.description"] ??
    "Transparent pricing for the SoSS website factory. Start free with unlimited drafts; upgrade to publish more sites, get found on Google, connect custom domains, and manage clients at scale.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/pricing`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}/${l}/pricing`]),
      ),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/pricing`,
      siteName: "SoSS Engine",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cc?: string }>;
}) {
  const { cc } = await searchParams;
  return <PricingPage ccOverride={cc} />;
}
