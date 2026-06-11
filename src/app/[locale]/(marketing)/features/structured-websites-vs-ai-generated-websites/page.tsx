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
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `${baseUrl}/${l}${path}`])),
        'x-default': `${baseUrl}/en${path}`,
      },
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
  const locale = await getLocale()
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : 'http://localhost:3000'
  const path = '/features/structured-websites-vs-ai-generated-websites'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Stop Prompting. Start Publishing. — Structured Website Builder vs AI',
    description:
      'Most AI website builders generate pages. You still need to figure out what those pages should be. SaaS of SaaS starts with proven structures and uses AI for content, translation, and localization.',
    url: `${baseUrl}/${locale}${path}`,
    inLanguage: locale,
    datePublished: '2026-06-01',
    dateModified: '2026-06-01',
    author: {
      '@type': 'Organization',
      name: 'SaaSofSaaSs',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SaaSofSaaSs',
      url: baseUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <StructuredVsAIPage />
    </>
  )
}
