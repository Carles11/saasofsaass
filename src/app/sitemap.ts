import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import { db } from "@/5-shared/lib/db";
import { tenants, tenantEntities, workspaces, tenantDomains } from "@/5-shared/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { isTenantIndexable } from "@/5-shared/lib/billing/plans";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";
  const rootUrl = `https://${rootDomain}`;

  // Only list sites that are actually indexable: published AND seoEnabled AND on a
  // plan that permits indexing (free sites are noindex, so they never belong here).
  const activeTenants = (
    await db
      .select({
        slug: tenants.slug,
        locales: tenants.locales,
        defaultLocale: tenants.defaultLocale,
        updatedAt: tenants.updatedAt,
        seoEnabled: tenants.seoEnabled,
        plan: workspaces.plan,
        customDomain: tenantDomains.domain,
      })
      .from(tenants)
      .leftJoin(workspaces, eq(tenants.workspaceId, workspaces.id))
      .leftJoin(
        tenantDomains,
        and(
          eq(tenantDomains.tenantId, tenants.id),
          eq(tenantDomains.status, "verified"),
        ),
      )
      .where(eq(tenants.status, "published"))
  ).filter((t) => isTenantIndexable(t.seoEnabled, t.plan ?? "free"));

  // Primary host per tenant — the verified custom domain wins over the subdomain
  // so the sitemap only ever lists the canonical URL.
  const hostForSlug = new Map(
    activeTenants.map((t) => [
      t.slug,
      t.customDomain ?? `${t.slug}.${rootDomain}`,
    ]),
  );

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
    const tenantUrl = `https://${hostForSlug.get(tenant.slug)}`;

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
    const tenantUrl = `https://${hostForSlug.get(entity.tenantSlug)}`;
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
