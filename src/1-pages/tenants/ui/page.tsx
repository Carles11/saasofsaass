import { BlockRenderer } from "@/2-widgets/tenant/BlockRenderer";
import TenantLayoutResolver from "@/2-widgets/tenant/ui/TenantLayoutResolver";
import { getBlocksByTenantId } from "@/4-entities/block";
import { getTenantByDomain } from "@/4-entities/tenant";
import { TenantPageProps } from "@/5-shared/types";
import { notFound } from "next/navigation";

export async function TenantPage({ context }: TenantPageProps) {
  const { tenant, domain, locale, isSubdomain } = context;

  const tenantData = await getTenantByDomain({ tenant, domain, isSubdomain });
  if (!tenantData) notFound();

  const tenantBlocks = await getBlocksByTenantId(tenantData.id);

  // Build CSS custom properties from tenant branding (e.g. { primary: '239 84% 67%' })
  // fontHeading/fontBody are stored as CSS var refs like "var(--font-playfair-display)"
  // They are NOT emitted as root-level CSS vars (blocks use --font-heading/--font-body
  // which are set via TenantLayoutResolver inline styles instead)
  const branding = (tenantData.branding ?? {}) as Record<string, string>;
  const fontHeading = branding.fontHeading;
  const fontBody = branding.fontBody;
  const cssVars = Object.entries(branding)
    .filter(([k]) => k !== "fontHeading" && k !== "fontBody" && k !== "palette")
    .map(([k, v]) => `--${k}: ${v}`)
    .join("; ");

  return (
    <>
      {cssVars && <style>{`:root { ${cssVars} }`}</style>}
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
