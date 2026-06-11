import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'saasofsaass.com'
  const rootUrl = `https://${rootDomain}`

  // Root sitemap delegates to two streams.
  // Next.js App Router serves each file at /sitemap-marketing.xml and /sitemap-tenants.xml.
  // Google Search Console can monitor each stream independently.
  return [
    {
      url: `${rootUrl}/sitemap-marketing.xml`,
      lastModified: new Date(),
    },
    {
      url: `${rootUrl}/sitemap-tenants.xml`,
      lastModified: new Date(),
    },
  ]
}
