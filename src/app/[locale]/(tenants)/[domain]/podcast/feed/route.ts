import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/5-shared/lib/db'
import { tenants, tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

function rssDate(date: Date | string | null): string {
  if (!date) return new Date().toUTCString()
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toUTCString()
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ locale: string; domain: string }> },
) {
  const { locale, domain } = await context.params

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saasofsaass.com'
  const isSubdomain =
    (domain.endsWith(`.${rootDomain}`) && domain !== rootDomain) ||
    /^[a-z0-9][a-z0-9-]*\.localhost$/.test(domain)
  const tenantKey = isSubdomain ? domain.split('.')[0] : domain

  const tenant = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.slug, tenantKey), eq(tenants.isActive, true)))
    .limit(1)
    .then((rows) => rows[0] ?? null)

  if (!tenant) {
    return new NextResponse('Tenant not found', { status: 404 })
  }

  const baseUrl = `https://${tenant.slug}.${rootDomain}`
  const feedUrl = `${baseUrl}/${locale}/podcast/feed`

  const rows = await db
    .select({
      entity: tenantEntities,
      translation: tenantTranslations,
    })
    .from(tenantEntities)
    .leftJoin(
      tenantTranslations,
      and(
        eq(tenantTranslations.entityId, tenantEntities.id),
        eq(tenantTranslations.locale, locale),
      ),
    )
    .where(
      and(
        eq(tenantEntities.tenantId, tenant.id),
        eq(tenantEntities.kind, 'podcast_episode'),
        eq(tenantEntities.status, 'published'),
      ),
    )
    .orderBy(desc(tenantEntities.publishedAt))
    .limit(50)

  const items = rows.map(({ entity, translation }) => {
    const payload = translation?.payload as Record<string, unknown> | null
    const title = (payload?.title as string) ?? entity.slug ?? entity.id
    const description = (payload?.description as string) ?? ''
    const slug = (payload?.localizedSlug as string) ?? entity.slug
    const meta = entity.metadata as Record<string, unknown> | null
    const durationSeconds = (meta?.durationSeconds as number) ?? 0
    const coverImageUrl = entity.coverImageUrl ?? ''

    const durationStr = durationSeconds > 0
      ? `\n      <itunes:duration>${durationSeconds}</itunes:duration>`
      : ''

    const imageTag = coverImageUrl
      ? `\n      <itunes:image href="${escapeXml(coverImageUrl)}"/>`
      : ''

    return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${baseUrl}/${locale}/podcast/${slug}</link>
      <guid isPermaLink="true">${baseUrl}/${locale}/podcast/${slug}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${rssDate(entity.publishedAt)}</pubDate>${durationStr}${imageTag}
    </item>`
  })

  const latestCover = rows[0]?.entity?.coverImageUrl ?? ''
  const itunesImage = latestCover
    ? `\n    <itunes:image href="${escapeXml(latestCover)}"/>`
    : ''

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(tenant.name)}</title>
    <link>${baseUrl}/${locale}/podcast</link>
    <description>Podcast by ${escapeXml(tenant.name)}</description>
    <language>${locale}</language>
    <itunes:author>${escapeXml(tenant.name)}</itunes:author>${itunesImage}
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${rssDate(new Date())}</lastBuildDate>${items.join('')}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
