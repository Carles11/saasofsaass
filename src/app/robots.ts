import type { MetadataRoute } from "next";

/**
 * Root-domain robots.txt. Tenant sites (subdomains / custom domains) carry their
 * own per-page robots meta — gated by `isTenantIndexable` — which is the
 * authoritative indexing signal there; this file governs the marketing/app host.
 *
 * Disallowed paths use a leading-wildcard so they match under every locale
 * prefix (e.g. `/en/auth/...`, `/es/invite/...`).
 */
export default function robots(): MetadataRoute.Robots {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";
  const rootUrl = `https://${rootDomain}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/*/auth/",
        "/*/invite/",
        "/*/dashboard",
      ],
    },
    sitemap: `${rootUrl}/sitemap.xml`,
    host: rootUrl,
  };
}
