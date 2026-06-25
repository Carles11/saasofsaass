import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import { db } from "@/5-shared/lib/db";
import { tenants, tenantEntities } from "@/5-shared/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";
  const rootUrl = `https://${rootDomain}`;

  const activeTenants = await db
    .select({
      slug: tenants.slug,
      locales: tenants.locales,
      defaultLocale: tenants.defaultLocale,
      updatedAt: tenants.updatedAt,
    })
    .from(tenants)
    .where(eq(tenants.status, "published"));

  const publishedEntities = await db
    .select({
      tenantSlug: tenants.slug,
      kind: tenantEntities.kind,
      slug: tenantEntities.slug,
      updatedAt: tenantEntities.updatedAt,
    })
    .from(tenantEntities)
    .innerJoin(tenants, eq(tenantEntities.tenantId, tenants.id))
    .where(
      and(
        inArray(tenantEntities.kind, ["blog_post", "podcast_episode"]),
        eq(tenantEntities.status, "published"),
        eq(tenants.status, "published"),
      ),
    );

  const entries: MetadataRoute.Sitemap = [];

  // Marketing pages — one entry per locale
  for (const locale of SUPPORTED_LOCALES) {
    entries.push({
      url: `${rootUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Tenant sites — each locale on its own subdomain
  for (const tenant of activeTenants) {
    const locales = (tenant.locales ?? [tenant.defaultLocale]) as string[];
    const tenantUrl = `https://${tenant.slug}.${rootDomain}`;

    for (const locale of locales) {
      // Homepage
      entries.push({
        url: `${tenantUrl}/${locale}`,
        lastModified: tenant.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // Blog list
      entries.push({
        url: `${tenantUrl}/${locale}/blog`,
        lastModified: tenant.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });

      // Podcast list
      entries.push({
        url: `${tenantUrl}/${locale}/podcast`,
        lastModified: tenant.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Individual blog posts and podcast episodes
  for (const entity of publishedEntities) {
    const tenant = activeTenants.find((t) => t.slug === entity.tenantSlug);
    if (!tenant) continue;

    const locales = (tenant.locales ?? [tenant.defaultLocale]) as string[];
    const tenantUrl = `https://${entity.tenantSlug}.${rootDomain}`;
    const path = entity.kind === "blog_post" ? "blog" : "podcast";

    for (const locale of locales) {
      entries.push({
        url: `${tenantUrl}/${locale}/${path}/${entity.slug}`,
        lastModified: entity.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
