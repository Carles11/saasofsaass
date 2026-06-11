import { MarketingPage } from "@/1-pages/marketing";
import { routing } from "@/5-shared/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
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

  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : 'http://localhost:3000'

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
    description:
      'A multi-tenant infrastructure engine and SaaS platform builder featuring automated subdomain routing, custom domain mapping, and native internationalization across 8 languages.',
    featureList: [
      'Multi-tenant subdomain and custom domain routing',
      'Content block engine with 6 block types and multiple variants',
      'Native internationalization for 8 languages with AI-assisted translation',
      'Role-based access control (owner and editor roles)',
      'Dynamic sitemap and hreflang generation per tenant',
      'Edge middleware proxy for zero-config tenant resolution',
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
        name: 'Do I need to be a developer to use SoSS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not at all. If you can use a word processor, you can use SoSS. You set up the site structure once using our visual builder, and your client handles everything after that.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does my client edit their site?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You invite them as an editor. They get a clean, simple dashboard where they can update text, upload images, and write blog posts — without being able to break anything.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I offer SoSS as part of my services?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. Many of our users charge their clients a monthly fee for website management. SoSS works behind the scenes — your client just sees a site that looks like yours.',
        },
      },
      {
        '@type': 'Question',
        name: 'What languages can a site be in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SoSS supports 8 languages: English, Spanish, Catalan, French, German, Italian, Basque, and Irish/Galician. Add a new language in one click and AI translates everything automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can each client have their own domain?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every site gets a free subdomain to start, and you can connect a custom domain from your dashboard in minutes.',
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
      <MarketingPage />
    </>
  )
}