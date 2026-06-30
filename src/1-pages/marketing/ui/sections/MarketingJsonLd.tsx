import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";

/**
 * Canonical Organization + WebSite structured data for the marketing site,
 * emitted as a single linked `@graph`. This is the platform's single source of
 * truth for the Organization node — every marketing page should render this once
 * so search engines and AI answer engines resolve one consistent entity
 * (referenced elsewhere by its stable `@id`).
 *
 * The `@id` anchors (`#organization`, `#website`) let other JSON-LD on the page
 * (Article publisher, BreadcrumbList, FAQPage) point back to the same entity by
 * reference instead of redefining it.
 */
export function MarketingJsonLd({ locale }: { locale: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "SoSS Engine",
        url: baseUrl,
        description:
          "SoSS Engine is a multi-tenant website builder for professionals, agencies and resellers — build unlimited multilingual client websites, with a free plan that includes a custom domain.",
        slogan: "The truly free, multilingual website builder for professionals and resellers.",
        knowsLanguage: [...SUPPORTED_LOCALES],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: "SoSS Engine",
        url: baseUrl,
        inLanguage: locale,
        publisher: { "@id": `${baseUrl}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
