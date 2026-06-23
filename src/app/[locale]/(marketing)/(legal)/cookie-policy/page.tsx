import CookiePolicyPage from "@/1-pages/marketing/legal/CookiePolicyPage";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations, getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.legal.cookie", locale);
  const title = t["meta.title"] ?? "Cookie Policy | SoSS Engine";
  const description =
    t["meta.description"] ??
    "This policy explains how SoSS Engine uses cookies and similar technologies to improve your experience.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = `/cookie-policy`;

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

export default async function Page() {
  const locale = await getLocale();
  const all = await getPlatformTranslationsByNamespaces(
    ["marketing.legal.cookie", "marketing.footer"],
    locale,
  );
  return (
    <CookiePolicyPage
      translations={all["marketing.legal.cookie"]}
      footerTranslations={all["marketing.footer"]}
      lang={locale}
    />
  );
}
