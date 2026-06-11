import { MarketingPage } from "@/1-pages/marketing";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.meta", locale);
  const title = t["title"] ?? "SoSS Engine — Website Factory for Professionals";
  const description =
    t["description"] ??
    "Create unlimited professional websites for your clients. No coding needed. You manage the structure, your clients edit the content.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}/${l}`])
      ),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
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
  return <MarketingPage />;
}
