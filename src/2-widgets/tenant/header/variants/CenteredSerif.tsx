import Link from "next/link";
import { LanguageSelector, NavLinks, PoweredBadge } from "../internal/shared";
import type { HeaderVariantProps } from "../internal/types";

export function CenteredSerif({
  tenant,
  navLinks,
  locale,
  isSubdomain,
  brandMark,
  logoHref,
  tenantLogoUrl,
  hasLocales,
}: HeaderVariantProps) {
  return (
    <header
      className="w-full bg-background/80 supports-backdrop-filter:bg-background/65 backdrop-blur-md border-b border-border py-6 px-4 flex flex-col items-center gap-4 sticky top-0 z-50"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      <Link href={logoHref} aria-label="Home" className="no-underline">
        {tenantLogoUrl ? (
          <div className="flex justify-center">{brandMark}</div>
        ) : (
          brandMark
        )}
      </Link>
      <NavLinks links={navLinks} className="flex-wrap justify-center" />
      {(hasLocales || isSubdomain) && (
        <div className="flex items-center gap-3 mt-1">
          {hasLocales && (
            <LanguageSelector
              locales={tenant.locales}
              currentLocale={locale}
            />
          )}
          <PoweredBadge isSubdomain={isSubdomain} />
        </div>
      )}
    </header>
  );
}
