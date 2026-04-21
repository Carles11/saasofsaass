import type { BlockProps } from "../../../config/types";
// import { SUPPORTED_LOCALES } from '@/5-shared/config/languages/supportedLanguages'

interface NavbarConfig {
  links?: Array<{ label: string; href: string }>;
}

function sanitizeHref(href: string): string {
  const isSafe = href.startsWith("/") || href.startsWith("https://");
  return isSafe ? href : "#";
}

export function NavbarBlock({ config, t, tenant, locale }: BlockProps & { locale: string }) {
  const { links = [] } = config as NavbarConfig;
  const siteTitle = t.siteTitle ?? tenant.name;

  // SSR-safe: fallback to root for language tab links
  const pathAfterLocale = "";
  const branding = (tenant.branding as { logoUrl?: string; primaryColor?: string }) || {};

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
      <div className="flex items-center gap-4">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={siteTitle}
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-black text-xl tracking-tighter uppercase text-zinc-900">
            {siteTitle}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Language Selector Tabs (SSR-safe links) */}
        <div className="flex items-center gap-1">
          {tenant.locales.map((l) => (
            <a
              key={l}
              href={`/${l}${pathAfterLocale ? "/" + pathAfterLocale : ""}`.replace(/\/$/, "")}
              className={`uppercase text-xs font-bold px-3 py-1 rounded transition-colors ${l === locale ? "bg-primary text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
              aria-current={l === locale ? "page" : undefined}
            >
              {l}
            </a>
          ))}
        </div>
        {links.length > 0 && (
          <ul className="hidden sm:flex items-center gap-6">
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={sanitizeHref(link.href)}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
