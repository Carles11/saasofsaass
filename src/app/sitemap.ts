import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
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
    .where(eq(tenants.isActive, true));

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
      entries.push({
        url: `${tenantUrl}/${locale}`,
        lastModified: tenant.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
