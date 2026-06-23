import { LOCALE_LABELS } from "@/5-shared/config/languages/supportedLanguages";
import type { Tenant } from "@/5-shared/lib/db/schema";
import { LanguageSwitcher } from "@/5-shared/i18n/LanguageSwitcher";

interface NavLink {
  label: string;
  href: string;
}

interface UnifiedHeaderProps {
  tenant: Tenant;
  navLinks: NavLink[];
  locale: string;
  isSubdomain: boolean;
  templateId: string;
}

function PoweredBadge({ isSubdomain }: { isSubdomain: boolean }) {
  if (!isSubdomain) return null;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";

  return (
    <a
      href={`https://${rootDomain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors no-underline"
    >
      Powered by SoSS<span className="text-primary">.</span>
    </a>
  );
}

function LanguageSelector({ locales, currentLocale }: { locales: string[]; currentLocale: string }) {
  if (locales.length < 2) return null;

  if (locales.length > 2) {
    return <LanguageSwitcher locales={locales} />;
  }

  return (
    <nav aria-label="Language selector" className="flex items-center gap-0.5">
      {locales.map((l) => (
        <a
          key={l}
          href={`/${l}`}
          className={`uppercase text-xs font-bold px-2 py-1 rounded transition-colors ${
            l === currentLocale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
          aria-current={l === currentLocale ? "page" : undefined}
        >
          {LOCALE_LABELS[l] ?? l}
        </a>
      ))}
    </nav>
  );
}

function NavLinks({ links, className = "" }: { links: NavLink[]; className?: string }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Section navigation" className={`flex gap-4 sm:gap-6 ${className}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function MobileMenu({ links, isSubdomain }: { links: NavLink[]; isSubdomain: boolean }) {
  if (links.length === 0 && !isSubdomain) return null;

  return (
    <details className="group relative md:hidden">
      <summary className="list-none flex items-center justify-center w-8 h-8 cursor-pointer text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors">
        <span className="group-open:hidden">☰</span>
        <span className="hidden group-open:block">✕</span>
      </summary>
      <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-lg shadow-lg p-4 flex flex-col gap-3 z-50">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}
        {isSubdomain && (
          <div className="pt-2 border-t border-border">
            <PoweredBadge isSubdomain={isSubdomain} />
          </div>
        )}
      </div>
    </details>
  );
}

export default function UnifiedHeader({
  tenant,
  navLinks,
  locale,
  isSubdomain,
  templateId,
}: UnifiedHeaderProps) {
  const branding = (tenant.branding as { logoUrl?: string }) ?? {};
  const hasLocales = (tenant.locales?.length ?? 0) >= 2;

  const brandMark = branding.logoUrl ? (
    <img
      src={branding.logoUrl}
      alt={tenant.name}
      className="h-8 w-auto object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    <span className="font-black text-xl tracking-tighter uppercase text-foreground">
      {tenant.name}
    </span>
  );

  if (templateId === "classic") {
    return (
      <header
        className="w-full bg-background border-b border-border py-6 px-4 flex flex-col items-center gap-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <a href="/" aria-label="Home" className="no-underline">
          {branding.logoUrl ? <div className="flex justify-center">{brandMark}</div> : brandMark}
        </a>
        <NavLinks links={navLinks} className="flex-wrap justify-center" />
        {(hasLocales || isSubdomain) && (
          <div className="flex items-center gap-3 mt-1">
            {hasLocales && <LanguageSelector locales={tenant.locales} currentLocale={locale} />}
            <PoweredBadge isSubdomain={isSubdomain} />
          </div>
        )}
      </header>
    );
  }

  if (templateId === "modern") {
    return (
      <header
        className="h-16 flex items-center justify-between px-4 sm:px-8 bg-background/70 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <a href="/" aria-label="Home" className="flex items-center gap-4 no-underline">
          {brandMark}
        </a>

        <div className="hidden md:flex items-center gap-6">
          <NavLinks links={navLinks} />
          {hasLocales && <LanguageSelector locales={tenant.locales} currentLocale={locale} />}
          <PoweredBadge isSubdomain={isSubdomain} />
        </div>

        <div className="flex md:hidden items-center gap-2 isolate">
          {hasLocales && <LanguageSelector locales={tenant.locales} currentLocale={locale} />}
          <MobileMenu links={navLinks} isSubdomain={isSubdomain} />
        </div>
      </header>
    );
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-8 bg-background border-b border-border sticky top-0 z-50"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      <a href="/" aria-label="Home" className="flex items-center gap-4 no-underline">
        {brandMark}
      </a>

      <div className="hidden md:flex items-center gap-6">
        <NavLinks links={navLinks} />
        {hasLocales && <LanguageSelector locales={tenant.locales} currentLocale={locale} />}
        <PoweredBadge isSubdomain={isSubdomain} />
      </div>

      <div className="flex md:hidden items-center gap-2 isolate">
        {hasLocales && <LanguageSelector locales={tenant.locales} currentLocale={locale} />}
        <MobileMenu links={navLinks} isSubdomain={isSubdomain} />
      </div>
    </header>
  );
}
