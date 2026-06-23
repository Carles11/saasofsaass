import { TERMS_VERSION } from "@/5-shared/config/legal/versions";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { MarketingHeader } from "../ui/sections/MarketingHeader";
import { FooterSection } from "../ui/sections/FooterSection";
import {
  TermsUseSection,
  TermsAccountSection,
  TermsSubscriptionSection,
  TermsContentSection,
  TermsUserContentSection,
  TermsProhibitedSection,
  TermsTerminationSection,
  TermsDisclaimerSection,
  TermsChangesSection,
  TermsContactSection,
} from "./sections/terms";

type Props = {
  translations: TranslationDict;
  headerTranslations?: TranslationDict;
  footerTranslations?: TranslationDict;
  lang: string;
};

export default function TermsOfServicePage({ translations, headerTranslations, footerTranslations, lang }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader translations={headerTranslations} />
      <header className="py-12 px-4 text-center border-b border-border">
        <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground mb-6">
          {resolveTranslation(translations, "title", "Terms of Service")}
        </h1>
        <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
          {resolveTranslation(translations, "version", "Last updated on ")}
          {TERMS_VERSION}
        </div>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          {resolveTranslation(
            translations,
            "intro",
            "These Terms of Service govern your use of the SoSS Engine platform.",
          )}
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-16">
        <aside className="hidden md:block md:w-64 shrink-0">
          <nav className="sticky top-24 flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-4">
              {resolveTranslation(translations, "navigation", "Table of Contents")}
            </p>
            {[
              { href: "#use", key: "use.title", fallback: "1. Use of Service" },
              { href: "#account", key: "account.title", fallback: "2. Account Registration" },
              { href: "#billing", key: "billing.title", fallback: "3. Payments & Subscriptions" },
              { href: "#content", key: "content.title", fallback: "4. Intellectual Property" },
              { href: "#user-content", key: "user_content.title", fallback: "5. User Content" },
              { href: "#prohibited", key: "prohibited.title", fallback: "6. Prohibited Conduct" },
              { href: "#termination", key: "termination.title", fallback: "7. Termination" },
              { href: "#disclaimer", key: "disclaimer.title", fallback: "8. Disclaimers & Liability" },
              { href: "#changes", key: "changes.title", fallback: "9. Changes to Terms" },
              { href: "#contact", key: "contact.title", fallback: "10. Contact" },
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
          <TermsUseSection translations={translations} />
          <TermsAccountSection translations={translations} />
          <TermsSubscriptionSection translations={translations} />
          <TermsContentSection translations={translations} />
          <TermsUserContentSection translations={translations} />
          <TermsProhibitedSection translations={translations} />
          <TermsTerminationSection translations={translations} />
          <TermsDisclaimerSection translations={translations} />
          <TermsChangesSection translations={translations} />
          <TermsContactSection translations={translations} />
        </main>
      </div>

      <FooterSection translations={footerTranslations} locale={lang} />
    </div>
  );
}
