import { getTemplate, HeaderVariantId } from "@/5-shared/config/templates";
import type { Tenant } from "@/5-shared/lib/db/schema";
import Image from "next/image";
import type { NavLink } from "./internal/shared";
import type { HeaderVariantProps } from "./internal/types";
import { CenteredSerif } from "./variants/CenteredSerif";
import { FloatingPill } from "./variants/FloatingPill";
import { StickyBlur } from "./variants/StickyBlur";
import { StickyMinimal } from "./variants/StickyMinimal";

interface UnifiedHeaderProps {
  tenant: Tenant;
  navLinks: NavLink[];
  locale: string;
  isSubdomain: boolean;
  templateId: string;
}

const VARIANTS: Record<
  HeaderVariantId,
  (props: HeaderVariantProps) => React.ReactNode
> = {
  "centered-serif": CenteredSerif,
  "sticky-blur": StickyBlur,
  "sticky-minimal": StickyMinimal,
  "floating-pill": FloatingPill,
};

export default function UnifiedHeader({
  tenant,
  navLinks,
  locale,
  isSubdomain,
  templateId,
}: UnifiedHeaderProps) {
  const branding = (tenant.branding ?? {}) as Record<string, unknown>;
  const logoData = branding.logo as
    | { url?: string; s3Key?: string; linkUrl?: string }
    | undefined;
  const tenantLogoUrl = logoData?.url ?? null;
  const tenantLogoLinkUrl = logoData?.linkUrl ?? null;
  const hasLocales = (tenant.locales?.length ?? 0) >= 2;

  const logoHref = tenantLogoLinkUrl || "/";

  const brandMark = tenantLogoUrl ? (
    <>
      <Image
        src={tenantLogoUrl}
        alt={`${tenant.name} logo`}
        className="h-16 w-auto max-h-16 object-contain"
        width={150}
        height={150}
        unoptimized
      />
      <span className="font-black text-xl tracking-tighter uppercase text-foreground">
        {tenant.name}
      </span>
    </>
  ) : (
    <span className="font-black text-xl tracking-tighter uppercase text-foreground">
      {tenant.name}
    </span>
  );

  const template = getTemplate(templateId);
  const Variant = VARIANTS[template.variants.header];

  return (
    <Variant
      tenant={tenant}
      navLinks={navLinks}
      locale={locale}
      isSubdomain={isSubdomain}
      brandMark={brandMark}
      logoHref={logoHref}
      tenantLogoUrl={tenantLogoUrl}
      hasLocales={hasLocales}
    />
  );
}
