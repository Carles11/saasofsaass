import { COOKIE_CONSENT_VERSION } from "@/5-shared/config/legal/versions";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { MarketingHeader } from "../ui/sections/MarketingHeader";
import { FooterSection } from "../ui/sections/FooterSection";
import {
  CookieContactSection,
  CookieManageSection,
  CookieThirdPartySection,
  CookieTypesSection,
  CookieUpdatesSection,
  CookieUsageSection,
  CookieWhatSection,
} from "./sections/cookie";

type Props = {
  translations: TranslationDict;
  headerTranslations?: TranslationDict;
  footerTranslations?: TranslationDict;
  lang: string;
};

export default function CookiePolicyPage({ translations, headerTranslations, footerTranslations, lang }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader translations={headerTranslations} />
      <header className="py-12 px-4 text-center border-b border-border">
        <div className="inline-block mb-4 text-primary">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4-4 4 4 0 0 1-4-4 4 4 0 0 1-2 0Z" />
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="11" r="1" fill="currentColor" />
            <circle cx="16" cy="15" r="1" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground mb-6">
          {resolveTranslation(translations, "title", "Cookie Policy")}
        </h1>
        <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
          {resolveTranslation(translations, "version", "Last updated on ")}
          {COOKIE_CONSENT_VERSION}
        </div>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          {resolveTranslation(
            translations,
            "intro",
            "This policy explains how SoSS Engine uses cookies and similar technologies to improve your experience.",
          )}
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-16">
        <aside className="hidden md:block md:w-64 shrink-0">
          <nav className="sticky top-24 flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-4">
              {resolveTranslation(translations, "navigation", "Navigation")}
            </p>
            {[
              { href: "#what", key: "what_are_cookies.title", fallback: "What Are Cookies?" },
              { href: "#types", key: "types.title", fallback: "Types We Use" },
              { href: "#usage", key: "usage.title", fallback: "How We Use Them" },
              { href: "#manage", key: "manage.title", fallback: "Managing Preferences" },
              { href: "#third-party", key: "third_party.title", fallback: "Third-Party Services" },
              { href: "#updates", key: "updates.title", fallback: "Updates" },
              { href: "#contact", key: "contact.title", fallback: "Contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm py-2 px-3 rounded-lg transition-all hover:bg-muted hover:translate-x-1 text-muted-foreground hover:text-foreground"
              >
                {resolveTranslation(translations, link.key, link.fallback)}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 max-w-2xl">
          <CookieWhatSection translations={translations} />
          <CookieTypesSection translations={translations} />
          <CookieUsageSection translations={translations} />
          <CookieManageSection translations={translations} />
          <CookieThirdPartySection translations={translations} />
          <CookieUpdatesSection translations={translations} />
          <CookieContactSection translations={translations} />
        </main>
      </div>

      <FooterSection translations={footerTranslations} locale={lang} />
    </div>
  );
}
