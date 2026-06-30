import { ResellerValuePage } from "@/1-pages/marketing/ui/ResellerValuePage";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.reseller-value", locale);
  const title =
    t["meta.title"] ??
    "Earn by Reselling Websites — Recurring Revenue for Agencies";
  const description =
    t["meta.description"] ??
    "Build a client website once, charge a monthly fee to manage it, and keep the difference. Custom domains on all plans, 2 languages on free. See how much you could earn reselling websites.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = `/features/earn-by-reselling-websites`;

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
  return <ResellerValuePage />;
}
