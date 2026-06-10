import Link from "next/link";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

interface FooterSectionProps {
  translations?: TranslationDict;
}

export function FooterSection({ translations }: FooterSectionProps) {
  const copyright = resolveTranslation(
    translations,
    "copyright",
    "© {year} SoSS Engine. All rights reserved.",
    { year: new Date().getFullYear() },
  );

  return (
    <footer className="border-t border-border px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="text-xl font-black tracking-tighter text-foreground">
            SoSS
          </Link>
          <nav className="flex gap-6">
            {FOOTER_LINKS.map((link) => (
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
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
