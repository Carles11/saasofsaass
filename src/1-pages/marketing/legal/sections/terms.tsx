import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

type SectionProps = {
  translations: TranslationDict;
};

export function TermsUseSection({ translations }: SectionProps) {
  return (
    <section id="use" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "use.title", "1. Use of Service")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "use.desc",
          "You agree to use the SoSS Engine platform only for lawful purposes related to creating and managing websites for your clients. The platform is intended for professionals and agencies building multi-tenant websites.",
        )}
      </p>
    </section>
  );
}

export function TermsAccountSection({ translations }: SectionProps) {
  return (
    <section id="account" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "account.title", "2. Account Registration")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "account.desc",
          "You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. We use Neon Auth for secure authentication.",
        )}
      </p>
    </section>
  );
}

export function TermsSubscriptionSection({ translations }: SectionProps) {
  return (
    <section id="billing" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "billing.title", "3. Payments & Subscriptions")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "billing.desc",
          "Payments are processed securely via Stripe. All plans are billed monthly. You may upgrade, downgrade, or cancel your subscription at any time. Downgrading may affect access to certain features tied to your plan tier.",
        )}
      </p>
    </section>
  );
}

export function TermsContentSection({ translations }: SectionProps) {
  return (
    <section id="content" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "content.title", "4. Intellectual Property")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "content.desc",
          "All platform software, design, templates, and infrastructure — including the multi-tenant engine, block system, AI translation pipeline, and branding tools — are owned by SoSS Engine. You may not copy, modify, or redistribute the platform itself.",
        )}
      </p>
    </section>
  );
}

export function TermsUserContentSection({ translations }: SectionProps) {
  return (
    <section id="user-content" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "user_content.title", "5. User Content")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "user_content.desc",
          "You retain full ownership of all content you upload — including text, images, and branding — for your client websites. By using SoSS Engine, you grant us a limited license to host, store, and display this content specifically to provide our website-building services.",
        )}
      </p>
    </section>
  );
}

export function TermsProhibitedSection({ translations }: SectionProps) {
  const items = [
    {
      key: "prohibited.laws",
      label: "Violating any local or international laws",
    },
    {
      key: "prohibited.ip",
      label: "Uploading content that infringes on third-party intellectual property",
    },
    {
      key: "prohibited.malicious",
      label: "Attempting to reverse engineer, scrape, or interfere with platform infrastructure",
    },
    {
      key: "prohibited.access",
      label: "Unauthorized access to other users' tenant sites or data",
    },
    {
      key: "prohibited.domain_abuse",
      label: "Circumventing site, domain, or plan limits — for example, by creating multiple accounts to exceed plan caps",
    },
  ];

  return (
    <section id="prohibited" className="mb-14 scroll-mt-24 p-8 rounded-3xl bg-card border border-border shadow-sm">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "prohibited.title", "6. Prohibited Conduct")}
      </h2>
      <ul className="grid gap-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4 text-sm text-muted-foreground">
            <span className="shrink-0 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-[10px] font-bold">
              ✕
            </span>
            {resolveTranslation(translations, item.key, item.label)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TermsTerminationSection({ translations }: SectionProps) {
  return (
    <section id="termination" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "termination.title", "7. Termination")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "termination.desc",
          "We reserve the right to suspend or terminate accounts that violate these Terms or negatively impact platform stability. Upon termination, your client sites may be taken offline after a grace period.",
        )}
      </p>
    </section>
  );
}

export function TermsDisclaimerSection({ translations }: SectionProps) {
  return (
    <section id="disclaimer" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "disclaimer.title", "8. Disclaimers & Liability")}
      </h2>
      <div className="p-6 rounded-2xl bg-muted italic text-sm border-l-4 border-muted-foreground/30">
        {resolveTranslation(
          translations,
          "disclaimer.desc",
          'SoSS Engine is provided "as is". We are not liable for third-party content, server downtime, or loss of data beyond the subscription fees paid in the 30 days prior to the claim.',
        )}
      </div>
    </section>
  );
}

export function TermsChangesSection({ translations }: SectionProps) {
  return (
    <section id="changes" className="mb-14 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "changes.title", "9. Changes to Terms")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "changes.desc",
          "We update these terms as our platform evolves. The 'Last Updated' date will be updated accordingly. Continued use after changes constitutes acceptance.",
        )}
      </p>
    </section>
  );
}

export function TermsContactSection({ translations }: SectionProps) {
  return (
    <section id="contact" className="mb-14 scroll-mt-24 pt-10 border-t border-border">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "contact.title", "10. Contact")}
      </h2>
      <p className="text-muted-foreground">
        {resolveTranslation(translations, "contact.desc", "For questions about these Terms, contact:")}{" "}
        <a
          href="mailto:carles@rio-frances.com"
          className="font-semibold underline decoration-2 transition-all hover:opacity-70"
        >
          carles@rio-frances.com
        </a>
      </p>
    </section>
  );
}
