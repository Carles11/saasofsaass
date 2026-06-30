import Link from "next/link";
import {
  LanguageSelector,
  MobileMenu,
  NavLinks,
  PoweredBadge,
} from "../internal/shared";
import type { HeaderVariantProps } from "../internal/types";

export function StickyMinimal({
  tenant,
  navLinks,
  locale,
  isSubdomain,
  brandMark,
  logoHref,
  hasLocales,
}: HeaderVariantProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-8 bg-background/80 supports-backdrop-filter:bg-background/65 backdrop-blur-md border-b border-border sticky top-0 z-50"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      <Link
        href={logoHref}
        aria-label="Home"
        className="flex items-center gap-4 no-underline"
      >
        {brandMark}
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <NavLinks links={navLinks} />
        {hasLocales && (
          <LanguageSelector locales={tenant.locales} currentLocale={locale} />
        )}
        <PoweredBadge isSubdomain={isSubdomain} />
      </div>

      <div className="flex md:hidden items-center gap-2">
        {hasLocales && (
          <LanguageSelector locales={tenant.locales} currentLocale={locale} />
        )}
        <MobileMenu links={navLinks} isSubdomain={isSubdomain} />
      </div>
    </header>
  );
}
