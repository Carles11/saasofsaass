import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'saasofsaass.com'
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? `app.${rootDomain}`

  const isMarketing =
    host === rootDomain ||
    host === `www.${rootDomain}` ||
    host === 'localhost' ||
    host === 'localhost:3000'

  const isDashboard =
    host === appDomain ||
    host === 'app.localhost' ||
    host === 'app.localhost:3000'

  // Dashboard: never indexed
  if (isDashboard) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  // Marketing domain: allow indexers, block known training crawlers
  if (isMarketing) {
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/', '/_next/'],
        },
        { userAgent: 'GPTBot', disallow: '/' },
        { userAgent: 'CCBot', disallow: '/' },
        { userAgent: 'anthropic-ai', disallow: '/' },
        { userAgent: 'Claude-Web', disallow: '/' },
        { userAgent: 'Omgilibot', disallow: '/' },
        { userAgent: 'Diffbot', disallow: '/' },
      ],
      sitemap: `https://${rootDomain}/sitemap.xml`,
    }
  }

  // Tenant subdomain or custom domain: allow all crawlers, per-host sitemap
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `https://${host}/sitemap.xml`,
  }
}