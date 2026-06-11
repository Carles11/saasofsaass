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
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${baseUrl}/${l}`])
      ),
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

export default function Page() {
  // JSON-LD is critical for Generative Engine Optimization (GEO)
  // It feeds LLMs structured facts about your software entity.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SaaSofSaaSs",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "description": "A multi-tenant infrastructure engine and SaaS platform builder featuring automated subdomain routing, custom domains, and native internationalization.",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/PreOrder",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "SaaSofSaaSs"
    }
  };

  return (
    <>
      {/* Injecting Schema.org directly into the DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingPage />
    </>
  );
}