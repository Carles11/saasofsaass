import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

type SectionProps = {
  translations: TranslationDict;
  lang?: string;
};

export function PrivacyCollectSection({ translations, lang }: SectionProps) {
  const items = [
    {
      label: "collect.account",
      desc: "collect.account_desc",
      defaultLabel: "Account & Profile Data",
      defaultDesc: "Name, email, and preferred language provided during registration via Neon Auth.",
    },
    {
      label: "collect.usage",
      desc: "collect.usage_desc",
      defaultLabel: "Usage & Analytical Data",
      defaultDesc: "Interactions with our builder, feature usage, and page views tracked via Google Analytics 4 (GA4).",
    },
    {
      label: "collect.payment",
      desc: "collect.payment_desc",
      defaultLabel: "Transaction Data",
      defaultDesc: "Payment status and plan selection processed by Stripe. We do not store credit card details on our servers.",
    },
  ];

  return (
    <section id="collect" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "collect.title", "1. Information We Collect")}
      </h2>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-1 h-auto rounded-full bg-primary/30" />
            <div>
              <strong className="block text-foreground mb-1">
                {resolveTranslation(translations, item.label, item.defaultLabel)}
              </strong>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {resolveTranslation(translations, item.desc, item.defaultDesc)}
              </p>
            </div>
          </div>
        ))}
        <div className="flex gap-4">
          <div className="w-1 h-auto rounded-full bg-orange-300" />
          <p className="text-sm text-muted-foreground">
            <strong>{resolveTranslation(translations, "collect.cookies", "Cookies & Identifiers:")}</strong>{" "}
            {resolveTranslation(translations, "collect.cookies_desc", "We use functional and analytical cookies. See our ")}
            <a
              href={`/${lang?.toLowerCase() || "en"}/cookie-policy`}
              className="underline font-medium text-primary"
            >
              {resolveTranslation(translations, "collect.cookies_link", "Cookie Policy")}
            </a>{" "}
            {resolveTranslation(translations, "collect.cookies_desc2", "for granular details.")}
          </p>
        </div>
      </div>
    </section>
  );
}

export function PrivacyUseSection({ translations }: SectionProps) {
  const items = [
    { key: "use.improve", label: "Optimizing platform performance and features" },
    { key: "use.communicate", label: "Sending transactional emails about your account" },
    { key: "use.legal", label: "Processing subscription payments via Stripe" },
    { key: "use.security", label: "Preventing fraud and unauthorized access" },
  ];

  return (
    <section id="use" className="mb-16 scroll-mt-24 p-8 rounded-3xl bg-card border border-border shadow-sm">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "use.title", "2. How We Use Your Data")}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {resolveTranslation(translations, item.key, item.label)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PrivacySharingSection({ translations }: SectionProps) {
  return (
    <section id="sharing" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "sharing.title", "3. Third-Party Service Providers")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "sharing.desc",
          "We share limited data with essential partners: Neon (Database), Stripe (Payments), AWS S3 & CloudFront (Image Hosting), Google Analytics (Analytics), and Google Gemini (AI Translations). These partners are GDPR compliant where applicable.",
        )}
      </p>
    </section>
  );
}

export function PrivacyTransfersSection({ translations }: SectionProps) {
  return (
    <section id="transfers" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "transfers.title", "4. International Data Transfers")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "transfers.desc",
          "As we use services like Google (Cloud/Gemini), AWS, and Neon, your data may be processed in the United States and other regions. We ensure Standard Contractual Clauses are in place to protect your information.",
        )}
      </p>
    </section>
  );
}

export function PrivacyRightsSection({ translations }: SectionProps) {
  const items = [
    { key: "rights.access", label: "Right to access and export your data" },
    { key: "rights.object", label: "Right to object to analytical tracking" },
    { key: "rights.withdraw", label: "Right to delete your account and all associated sites" },
    { key: "rights.contact", label: "Contact us to exercise these rights" },
  ];

  return (
    <section id="rights" className="mb-16 scroll-mt-24 border-t border-border pt-12">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "rights.title", "5. Your Privacy Rights")}
      </h2>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="group p-4 rounded-xl transition-all hover:bg-muted border border-transparent hover:border-border flex items-center justify-between"
          >
            <span className="text-muted-foreground font-medium">
              {resolveTranslation(translations, item.key, item.label)}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
              →
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PrivacySecuritySection({ translations }: SectionProps) {
  return (
    <section id="security" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "security.title", "6. Data Security")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "security.desc",
          "We use industry-standard encryption (SSL/TLS) and secure database protocols provided by Neon to protect your data at rest and in transit. Images are served via CloudFront with signed URLs where applicable.",
        )}
      </p>
    </section>
  );
}

export function PrivacyRetentionSection({ translations }: SectionProps) {
  return (
    <section id="retention" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "retention.title", "7. Data Retention")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "retention.desc",
          "We retain your data as long as your account is active. Upon cancellation, your data is retained for 30 days before permanent deletion. Inactive free accounts may be archived after 6 months.",
        )}
      </p>
    </section>
  );
}

export function PrivacyUpdatesSection({ translations }: SectionProps) {
  return (
    <section id="updates" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "updates.title", "8. Policy Updates")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "updates.desc",
          "We may update this policy to reflect changes in our infrastructure or features. Significant changes will be notified via email.",
        )}
      </p>
    </section>
  );
}

export function PrivacyContactSection({ translations }: SectionProps) {
  return (
    <section id="contact" className="mb-16 scroll-mt-24 pt-12 border-t-2 border-primary/20">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "contact.title", "9. Privacy Contact")}
      </h2>
      <div className="p-8 rounded-3xl bg-primary text-primary-foreground shadow-xl">
        <p className="mb-6 opacity-80 text-sm">
          {resolveTranslation(
            translations,
            "contact.desc1",
            "For privacy-related requests (Data Access, Deletion, or GDPR inquiries), contact:",
          )}
        </p>
        <address className="not-italic space-y-1 text-lg">
          <p className="font-bold opacity-90">Carles del Río Francés</p>
          <p className="opacity-70">Elbestrasse 15</p>
          <p className="opacity-70">60329 Frankfurt am Main</p>
          <div className="pt-4 text-sm opacity-60">
            <p>Steuernummer: 013 861 02632</p>
            <p>Ust-Id. Nr.: DE275710941</p>
          </div>
          <div className="pt-6">
            <a
              href="mailto:carles@rio-frances.com"
              className="inline-block px-6 py-3 rounded-full bg-background text-foreground font-bold transition-transform hover:scale-105"
            >
              carles@rio-frances.com
            </a>
          </div>
        </address>
      </div>
    </section>
  );
}
