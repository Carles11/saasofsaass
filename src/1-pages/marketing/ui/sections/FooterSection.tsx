import Link from "next/link";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface FooterSectionProps {
  translations?: TranslationDict;
}

export function FooterSection({ translations }: FooterSectionProps) {
  const tagline = resolveTranslation(translations, "tagline", "Websites for your clients. Managed by you.");
  const copyright = resolveTranslation(
    translations,
    "copyright",
    "© {year} SoSS Engine. All rights reserved.",
    { year: new Date().getFullYear() },
  );

  const footerLinks = [
    { label: resolveTranslation(translations, "link.features", "Features"), href: "#features" },
    { label: resolveTranslation(translations, "link.pricing", "Pricing"), href: "#pricing" },
    { label: resolveTranslation(translations, "link.testimonials", "Testimonials"), href: "#testimonials" },
    { label: resolveTranslation(translations, "link.faq", "FAQ"), href: "#faq" },
  ];

  return (
    <footer className="border-t border-border px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="text-xl font-black tracking-tighter text-foreground">
            SoSS
          </Link>
          <nav className="flex gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {tagline}
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
