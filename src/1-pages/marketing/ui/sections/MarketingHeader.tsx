"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import { ThemeToggle } from "@/5-shared/theme/ThemeToggle";
import { PaletteSwitcher } from "@/5-shared/theme/PaletteSwitcher";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN", es: "ES", ca: "CA", fr: "FR",
  de: "DE", it: "IT", eu: "EU", ga: "GA",
};

interface MarketingHeaderProps {
  translations?: TranslationDict;
}

export function MarketingHeader({ translations }: MarketingHeaderProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLocaleChange(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  }

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  function navHref(homeAnchor: string, localAnchor?: string): string {
    if (isHome) return `#${homeAnchor}`;
    if (localAnchor) return `#${localAnchor}`;
    return `/${locale}/#${homeAnchor}`;
  }

  const navLinks = [
    { label: resolveTranslation(translations, "nav.how-it-works", "How It Works"), href: navHref("how-it-works") },
    { label: resolveTranslation(translations, "nav.features", "Features"), href: navHref("features") },
    { label: resolveTranslation(translations, "nav.structure-vs-ai", "Structure vs AI"), href: navHref("structure-vs-ai", "structure-vs-ai-faq") },
    { label: resolveTranslation(translations, "nav.pricing", "Pricing"), href: navHref("pricing") },
    { label: resolveTranslation(translations, "nav.faq", "FAQ"), href: navHref("faq", "structure-vs-ai-faq") },
  ];
  const signInLabel = resolveTranslation(translations, "sign-in", "Sign In");
  const getStartedLabel = resolveTranslation(translations, "get-started", "Start for Free");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="text-lg font-bold tracking-tight text-foreground"
        >
          SoSS<span className="text-primary">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <Select defaultValue={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="h-8 w-16 text-xs border-border/60 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" className="min-w-[4rem]">
              {SUPPORTED_LOCALES.map((l) => (
                <SelectItem key={l} value={l} className="text-xs">
                  {LOCALE_LABELS[l] ?? l.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ThemeToggle />
          <PaletteSwitcher />

          <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-border/60">
            <Button variant="ghost" size="sm" asChild className="text-sm">
              <Link href={`/${locale}/auth/sign-in`}>{signInLabel}</Link>
            </Button>
            <Button size="sm" asChild className="text-sm px-4">
              <Link href={`/${locale}/auth/sign-up`}>{getStartedLabel}</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-6 py-5 space-y-4">
          {navLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-border/60">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/${locale}/auth/sign-in`}>{signInLabel}</Link>
            </Button>
            <Button size="sm" asChild className="flex-1">
              <Link href={`/${locale}/auth/sign-up`}>{getStartedLabel}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}