import { SUPPORTED_LOCALES } from '@/5-shared/config/languages/supportedLanguages'
import type { MetadataRoute } from 'next'

const MARKETING_ROUTES = [
  '',
  '/features/structured-websites-vs-ai-generated-websites',
]

export default function sitemapMarketing(): MetadataRoute.Sitemap {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'saasofsaass.com'
  const rootUrl = `https://${rootDomain}`
  const entries: MetadataRoute.Sitemap = []

  for (const locale of SUPPORTED_LOCALES) {
    for (const route of MARKETING_ROUTES) {
      entries.push({
        url: `${rootUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.7,
      })
    }
  }

  return entries
}
