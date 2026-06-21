import { MarketingPage } from "@/1-pages/marketing";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.meta", locale);
  
  // High-intent SEO title targeting your exact architecture
  const title = t["title"] ?? "SaaSofSaaSs | Multi-Tenant Infrastructure & Platform Engine";
  
  // GEO-optimized description with clear entity definition and feature drops
  const description = t["description"] ?? 
    "SaaSofSaaSs is a complete multi-tenant infrastructure engine. Build, scale, and manage localized SaaS platforms with automated edge routing, custom domains, and native support for 11 languages. Launching Late 2026.";
  
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `${baseUrl}/${l}`])),
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: "SaaSofSaaSs",
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
  const underConstructionTranslations = await getPlatformTranslations("marketing.under-construction", locale)

  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : 'http://localhost:3000'

  const t = underConstructionTranslations

  const softwareDescription = resolveTranslation(t, "schema.software.description", "A multi-tenant infrastructure engine and SaaS platform builder featuring automated subdomain routing, custom domain mapping, and native internationalization across 8 languages.")
  const feature1 = resolveTranslation(t, "schema.software.feature-1", "Multi-tenant subdomain and custom domain routing")
  const feature2 = resolveTranslation(t, "schema.software.feature-2", "Content block engine with 6 block types and multiple variants")
  const feature3 = resolveTranslation(t, "schema.software.feature-3", "Native internationalization for 8 languages with AI-assisted translation")
  const feature4 = resolveTranslation(t, "schema.software.feature-4", "Role-based access control (owner and editor roles)")
  const feature5 = resolveTranslation(t, "schema.software.feature-5", "Dynamic sitemap and hreflang generation per tenant")
  const feature6 = resolveTranslation(t, "schema.software.feature-6", "Edge middleware proxy for zero-config tenant resolution")
  const faqQ1 = resolveTranslation(t, "schema.faq.q1", "Do I need to be a developer to use SoSS?")
  const faqA1 = resolveTranslation(t, "schema.faq.a1", "Not at all. If you can use a word processor, you can use SoSS. You set up the site structure once using our visual builder, and your client handles everything after that.")
  const faqQ2 = resolveTranslation(t, "schema.faq.q2", "How does my client edit their site?")
  const faqA2 = resolveTranslation(t, "schema.faq.a2", "You invite them as an editor. They get a clean, simple dashboard where they can update text, upload images, and write blog posts — without being able to break anything.")
  const faqQ3 = resolveTranslation(t, "schema.faq.q3", "Can I offer SoSS as part of my services?")
  const faqA3 = resolveTranslation(t, "schema.faq.a3", "Absolutely. Many of our users charge their clients a monthly fee for website management. SoSS works behind the scenes — your client just sees a site that looks like yours.")
  const faqQ4 = resolveTranslation(t, "schema.faq.q4", "What languages can a site be in?")
  const faqA4 = resolveTranslation(t, "schema.faq.a4", "SoSS supports 8 languages: English, Spanish, Catalan, French, German, Italian, Basque, and Galician. Add a new language in one click and AI translates everything automatically.")
  const faqQ5 = resolveTranslation(t, "schema.faq.q5", "Can each client have their own domain?")
  const faqA5 = resolveTranslation(t, "schema.faq.a5", "Yes. Every site gets a free subdomain to start, and you can connect a custom domain from your dashboard in minutes.")

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SaaSofSaaSs',
    alternateName: 'SoSS Engine',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Infrastructure',
    operatingSystem: 'Web',
    url: `${baseUrl}/${locale}`,
    inLanguage: locale,
    description: softwareDescription,
    featureList: [
      feature1,
      feature2,
      feature3,
      feature4,
      feature5,
      feature6,
    ],
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'SaaSofSaaSs',
      url: baseUrl,
      foundingDate: '2026',
      sameAs: ['https://github.com/Carles11/saasofsaass'],
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: faqQ1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqA1,
        },
      },
      {
        '@type': 'Question',
        name: faqQ2,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqA2,
        },
      },
      {
        '@type': 'Question',
        name: faqQ3,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqA3,
        },
      },
      {
        '@type': 'Question',
        name: faqQ4,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqA4,
        },
      },
      {
        '@type': 'Question',
        name: faqQ5,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqA5,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingPage translations={underConstructionTranslations} />
    </>
  )
}