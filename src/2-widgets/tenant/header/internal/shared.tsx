import { LOCALE_LABELS } from "@/5-shared/config/languages/supportedLanguages";
import { LanguageSwitcher } from "@/5-shared/i18n/LanguageSwitcher";

export interface NavLink {
  label: string;
  href: string;
}

export function PoweredBadge({ isSubdomain }: { isSubdomain: boolean }) {
  if (!isSubdomain) return null;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";

  return (
    <a
      href={`https://${rootDomain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors no-underline"
    >
      Powered by SofS
      <span className="text-primary">.</span>
    </a>
  );
}

export function LanguageSelector({
  locales,
  currentLocale,
}: {
  locales: string[];
  currentLocale: string;
}) {
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

export function NavLinks({
  links,
  className = "",
}: {
  links: NavLink[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Section navigation"
      className={`flex gap-4 sm:gap-6 ${className}`}
    >
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

export function MobileMenu({
  links,
  isSubdomain,
}: {
  links: NavLink[];
  isSubdomain: boolean;
}) {
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
