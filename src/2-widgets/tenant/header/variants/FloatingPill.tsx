import Link from "next/link";
import {
  LanguageSelector,
  MobileMenu,
  NavLinks,
  PoweredBadge,
} from "../internal/shared";
import type { HeaderVariantProps } from "../internal/types";

/**
 * Header variant: FloatingPill.
 *
 * A rounded floating bar at the top of the viewport, not full-width.
 * Sits on top of the hero with a soft shadow. Used by templates that
 * want a more "design-y", contemporary feel.
 */
export function FloatingPill({
  tenant,
  navLinks,
  locale,
  isSubdomain,
  brandMark,
  logoHref,
  hasLocales,
}: HeaderVariantProps) {
  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-8">
      <header
        className="mx-auto max-w-5xl flex items-center justify-between gap-4 h-14 px-4 sm:px-6 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <Link
          href={logoHref}
          aria-label="Home"
          className="flex items-center gap-3 no-underline shrink-0"
        >
          {brandMark}
        </Link>

        <div className="hidden md:flex items-center gap-5">
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
    </div>
  );
}
