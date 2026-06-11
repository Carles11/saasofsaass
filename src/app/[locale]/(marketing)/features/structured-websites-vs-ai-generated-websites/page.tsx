import { StructuredVsAIPage } from "@/1-pages/marketing/ui/StructuredVsAIPage";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.structured-vs-ai", locale);
  const title =
    t["meta.title"] ??
    "Stop Prompting. Start Publishing. — Structured Website Builder vs AI";
  const description =
    t["meta.description"] ??
    "Most AI website builders generate pages. You still need to figure out what those pages should be. SaaS of SaaS starts with proven structures and uses AI for content, translation, and localization.";
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = `/features/structured-websites-vs-ai-generated-websites`;

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
  return <StructuredVsAIPage />;
}
