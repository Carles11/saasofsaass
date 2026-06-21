import { db } from '@/5-shared/lib/db'
import { tenants } from '@/5-shared/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { MetadataRoute } from 'next'

export default async function sitemapTenants(): Promise<MetadataRoute.Sitemap> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'saasofsaass.com'
  const entries: MetadataRoute.Sitemap = []

  const activeTenants = await db
    .select({
      slug: tenants.slug,
      domain: tenants.domain,
      locales: tenants.locales,
      defaultLocale: tenants.defaultLocale,
      updatedAt: tenants.updatedAt,
    })
    .from(tenants)
    .where(eq(tenants.isActive, true))

  for (const tenant of activeTenants) {
    const tenantBaseUrl = tenant.domain
      ? `https://${tenant.domain}`
      : `https://${tenant.slug}.${rootDomain}`

    const locales = (tenant.locales ?? [tenant.defaultLocale]) as string[]

    for (const locale of locales) {
      entries.push({
        url: `${tenantBaseUrl}/${locale}`,
        lastModified: tenant.updatedAt ?? new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      })
    }
  }

  return entries
}
