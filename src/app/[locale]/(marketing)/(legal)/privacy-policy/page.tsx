import PrivacyPolicyPage from "@/1-pages/marketing/legal/PrivacyPolicyPage";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations, getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.legal.privacy", locale);
  const title = t["meta.title"] ?? "Privacy Policy | SoSS Engine";
  const description =
    t["meta.description"] ??
    "This policy describes how SoSS Engine protects your personal information. We are committed to transparency and global compliance.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = `/privacy-policy`;

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
    ["marketing.header", "marketing.legal.privacy", "marketing.footer"],
    locale,
  );
  return (
    <PrivacyPolicyPage
      translations={all["marketing.legal.privacy"]}
      headerTranslations={all["marketing.header"]}
      footerTranslations={all["marketing.footer"]}
      lang={locale}
    />
  );
}
