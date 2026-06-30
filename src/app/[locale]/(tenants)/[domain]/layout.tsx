import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantByDomain } from "@/4-entities/tenant";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import UnifiedHeader from "@/2-widgets/tenant/header/tenantHeader";
import { blockRegistry } from "@/2-widgets/tenant/BlockRenderer/config/registry";
import { resolveBlockT } from "@/2-widgets/tenant/BlockRenderer/config/utils/block";
import { PoweredByBadge, PoweredByStrip } from "@/2-widgets/tenant/ui/PoweredByBadge";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import { getPlanForWorkspace } from "@/5-shared/lib/billing/workspace";
import { showsCornerBadge, showsFooterBadge } from "@/5-shared/lib/billing/plans";
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

  // Platform branding (plan-driven): Free = corner badge + footer strip,
  // Pro = corner badge only, Enterprise = none.
  const plan = tenant ? await getPlanForWorkspace(tenant.workspaceId) : "free";
  const poweredByLabel = resolveTranslation(navT, "powered-by", "Powered by");
  const brandingHref =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${rootDomain}`;

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
      // Locale-aware hrefs: archive links keep the locale prefix; section anchors
      // always point at the homepage so they work from archive routes too.
      const href = entry?.archivePath
        ? `/${locale}${entry.archivePath}`
        : `/${locale}#${b.id}`;
      return { label, href };
    });

  return (
    <StoreHydrator tenant={tenant ?? null}>
      <div className={`min-h-screen selection:bg-foreground selection:text-background theme-${palette}`}>
        {tenant && (
          <UnifiedHeader
            tenant={tenant}
            navLinks={navLinks}
            locale={locale}
            isSubdomain={isSubdomain}
            templateId={tenant.templateId ?? "default"}
          />
        )}
        {children}
        {tenant && showsFooterBadge(plan) && (
          <PoweredByStrip href={brandingHref} label={poweredByLabel} />
        )}
      </div>
      {tenant && showsCornerBadge(plan) && (
        <PoweredByBadge href={brandingHref} label={poweredByLabel} />
      )}
    </StoreHydrator>
  );
}
