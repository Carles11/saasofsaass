import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantByDomain } from "@/4-entities/tenant";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import UnifiedHeader from "@/2-widgets/tenant/header/tenantHeader";
import { blockRegistry } from "@/2-widgets/tenant/BlockRenderer/config/registry";
import { resolveBlockT } from "@/2-widgets/tenant/BlockRenderer/config/utils/block";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import type { SupportedLocaleType } from "@/5-shared/types/languages/supportedLocales";
import { getLocale } from "next-intl/server";

export default async function TenantLayout({
  params,
  children,
}: {
  params: Promise<{ domain: string }>;
  children: React.ReactNode;
}) {
  const { domain } = await params;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";
  const isSubdomain =
    (domain.endsWith(`.${rootDomain}`) && domain !== rootDomain) ||
    /^[a-z0-9][a-z0-9-]*\.localhost$/.test(domain);
  const tenantKey = isSubdomain ? domain.split(".")[0] : domain;

  const tenant = await getTenantByDomain({
    tenant: tenantKey,
    domain,
    isSubdomain,
  });

  const palette =
    typeof tenant?.branding === "object" &&
    tenant?.branding !== null &&
    "palette" in (tenant.branding as Record<string, unknown>)
      ? ((tenant.branding as Record<string, string>).palette ?? "ocean")
      : "ocean";

  let locale: SupportedLocaleType = "en";
  try {
    locale = (await getLocale()) as SupportedLocaleType;
  } catch {}

  const defaultLocale = (tenant?.defaultLocale ?? "en") as SupportedLocaleType;

  let tenantBlocks: Awaited<ReturnType<typeof getBlocksByTenantId>> = [];
  if (tenant) {
    tenantBlocks = await getBlocksByTenantId(tenant.id);
  }

  const navT = await getPlatformTranslations("tenant.nav", locale);

  const navLinks = tenantBlocks
    .filter((b) => b.isVisible)
    .filter((b) => {
      const entry = blockRegistry[b.type as keyof typeof blockRegistry];
      const config = (b.config ?? {}) as Record<string, unknown>;
      const includeInNav = (config.includeInNav as boolean | undefined) ?? entry?.includeInNav;
      if (!includeInNav) return false;
      if (entry?.navLabel) return true;
      const t = resolveBlockT(b.translations, locale, defaultLocale);
      return !!(t.title || t.heading);
    })
    .map((b) => {
      const entry = blockRegistry[b.type as keyof typeof blockRegistry];
      const t = resolveBlockT(b.translations, locale, defaultLocale);
      const label = resolveTranslation(navT, b.type, entry?.navLabel ?? "") || t.title || t.heading || "";
      const href = entry?.archivePath ?? `#${b.id}`;
      return { label, href };
    });

  return (
    <StoreHydrator tenant={tenant ?? null}>
      {tenant && (
        <UnifiedHeader
          tenant={tenant}
          navLinks={navLinks}
          locale={locale}
          isSubdomain={isSubdomain}
          templateId={tenant.templateId ?? "default"}
        />
      )}
      <div className={`min-h-screen selection:bg-foreground selection:text-background theme-${palette}`}>
        {children}
      </div>
    </StoreHydrator>
  );
}
