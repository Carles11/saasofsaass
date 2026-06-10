"use client";

import Link from "next/link";
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
  en: "EN",
  es: "ES",
  ca: "CA",
  fr: "FR",
  de: "DE",
  it: "IT",
  eu: "EU",
  ga: "GA",
};

interface MarketingHeaderProps {
  translations?: TranslationDict;
}

export function MarketingHeader({ translations }: MarketingHeaderProps) {
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    {
      label: resolveTranslation(translations, "nav.features", "Features"),
      href: "#features",
    },
    {
      label: resolveTranslation(translations, "nav.pricing", "Pricing"),
      href: "#pricing",
    },
    {
      label: resolveTranslation(translations, "nav.testimonials", "Testimonials"),
      href: "#testimonials",
    },
    {
      label: resolveTranslation(translations, "nav.faq", "FAQ"),
      href: "#faq",
    },
  ];
  const signInLabel = resolveTranslation(translations, "sign-in", "Sign In");
  const getStartedLabel = resolveTranslation(translations, "get-started", "Get Started");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href={`/${locale}`} className="text-xl font-black tracking-tighter text-foreground">
          SoSS
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Select defaultValue={locale}>
            <SelectTrigger className="h-9 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LOCALES.map((l) => (
                <SelectItem key={l} value={l} className="text-xs">
                  {LOCALE_LABELS[l] ?? l.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeToggle />
          <PaletteSwitcher />
          <div className="hidden md:flex items-center gap-2 ml-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${locale}/auth/sign-in`}>{signInLabel}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/${locale}/auth/sign-up`}>{getStartedLabel}</Link>
            </Button>
          </div>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
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
