import { BlockRenderer } from "@/2-widgets/tenant/BlockRenderer";
import TenantLayoutResolver from "@/2-widgets/tenant/ui/TenantLayoutResolver";
import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantByDomain, getVerifiedCustomDomain } from "@/4-entities/tenant";
import { isTenantIndexable } from "@/5-shared/lib/billing/plans";
import { getPlanForWorkspace } from "@/5-shared/lib/billing/workspace";
import { TenantPageProps } from "@/5-shared/types";
import { notFound } from "next/navigation";

export async function TenantPage({ context }: TenantPageProps) {
  const { tenant, domain, locale, isSubdomain } = context;

  const tenantData = await getTenantByDomain({ tenant, domain, isSubdomain });
  if (!tenantData) notFound();

  const [tenantBlocks, plan, verifiedCustomDomain] = await Promise.all([
    getBlocksByTenantId(tenantData.id),
    getPlanForWorkspace(tenantData.workspaceId),
    getVerifiedCustomDomain(tenantData.id),
  ]);

  const primaryHost = verifiedCustomDomain ?? domain;
  const baseUrl = `https://${primaryHost}`;
  const indexable = isTenantIndexable(tenantData.seoEnabled, plan);

  // Extract social links from the footer block for Organization sameAs
  const footerBlock = tenantBlocks.find((b) => b.type === "footer");
  const config = footerBlock?.config as Record<string, unknown> | undefined;
  const socialLinks = (config?.socialLinks as Array<{ label: string; url: string }> | undefined) ?? [];
  const sameAs = socialLinks.map((l) => l.url).filter(Boolean);

  // Extract logo URL from branding (nested shape: { logo: { url: string } })
  const branding = (tenantData.branding ?? {}) as Record<string, unknown>;
  const logoData = branding.logo as { url?: string } | undefined;
  const logoUrl = logoData?.url ?? null;

  // Build CSS custom properties from tenant branding (e.g. { primary: '239 84% 67%' })
  // fontHeading/fontBody are stored as CSS var refs like "var(--font-playfair-display)"
  // They are NOT emitted as root-level CSS vars (blocks use --font-heading/--font-body
  // which are set via TenantLayoutResolver inline styles instead)
  const fontHeading = branding.fontHeading as string | undefined;
  const fontBody = branding.fontBody as string | undefined;
  const cssVars = Object.entries(branding)
    .filter(([k]) => k !== "fontHeading" && k !== "fontBody" && k !== "palette" && k !== "logo")
    .map(([k, v]) => `--${k}: ${v}`)
    .join("; ");

  const orgJsonLd = indexable
    ? {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: tenantData.name,
        url: baseUrl,
        ...(logoUrl ? { logo: logoUrl } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }
    : null;

  const websiteJsonLd = indexable
    ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: tenantData.name,
        url: baseUrl,
      }
    : null;

  return (
    <>
      {cssVars && <style>{`:root { ${cssVars} }`}</style>}
      {orgJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      )}
      {websiteJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      )}
      <TenantLayoutResolver
        templateId={
          (tenantData.templateId as import("@/5-shared/config/templates").TenantTemplateId) ||
          "default"
        }
        titleFont={fontHeading}
        bodyFont={fontBody}
      >
        <BlockRenderer blocks={tenantBlocks} locale={locale} tenant={tenantData} />
      </TenantLayoutResolver>
    </>
  );
}
