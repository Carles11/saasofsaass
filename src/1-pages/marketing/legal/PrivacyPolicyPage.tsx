import { PRIVACY_POLICY_VERSION } from "@/5-shared/config/legal/versions";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { MarketingHeader } from "../ui/sections/MarketingHeader";
import { FooterSection } from "../ui/sections/FooterSection";
import {
  PrivacyCollectSection,
  PrivacyContactSection,
  PrivacyRetentionSection,
  PrivacyRightsSection,
  PrivacySecuritySection,
  PrivacySharingSection,
  PrivacyTransfersSection,
  PrivacyUpdatesSection,
  PrivacyUseSection,
} from "./sections/privacy";

type Props = {
  translations: TranslationDict;
  headerTranslations?: TranslationDict;
  footerTranslations?: TranslationDict;
  lang: string;
};

export default function PrivacyPolicyPage({ translations, headerTranslations, footerTranslations, lang }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader translations={headerTranslations} />
      <header className="py-12 px-4 text-center border-b border-border">
        <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
          {resolveTranslation(translations, "badge", "Privacy First")}
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground pb-6">
          {resolveTranslation(translations, "title", "Privacy Policy")}
        </h1>
        <div className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
          {resolveTranslation(translations, "version", "Last updated on ")}
          {PRIVACY_POLICY_VERSION}
        </div>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          {resolveTranslation(
            translations,
            "intro",
            "This policy describes how SoSS Engine protects your personal information. We are committed to transparency and global compliance.",
          )}
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-16">
        <aside className="hidden md:block md:w-64 shrink-0">
          <nav className="sticky top-24 flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-4">
              {resolveTranslation(translations, "navigation", "Sections")}
            </p>
            {[
              { href: "#collect", key: "collect.title", fallback: "1. Information We Collect" },
              { href: "#use", key: "use.title", fallback: "2. How We Use It" },
              { href: "#sharing", key: "sharing.title", fallback: "3. Data Sharing" },
              { href: "#transfers", key: "transfers.title", fallback: "4. International Transfers" },
              { href: "#rights", key: "rights.title", fallback: "5. Your Rights" },
              { href: "#security", key: "security.title", fallback: "6. Data Security" },
              { href: "#retention", key: "retention.title", fallback: "7. Data Retention" },
              { href: "#updates", key: "updates.title", fallback: "8. Policy Changes" },
              { href: "#contact", key: "contact.title", fallback: "9. Contact" },
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
          <PrivacyCollectSection translations={translations} lang={lang} />
          <PrivacyUseSection translations={translations} />
          <PrivacySharingSection translations={translations} />
          <PrivacyTransfersSection translations={translations} />
          <PrivacyRightsSection translations={translations} />
          <PrivacySecuritySection translations={translations} />
          <PrivacyRetentionSection translations={translations} />
          <PrivacyUpdatesSection translations={translations} />
          <PrivacyContactSection translations={translations} />
        </main>
      </div>

      <FooterSection translations={footerTranslations} locale={lang} />
    </div>
  );
}
