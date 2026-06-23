import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

type SectionProps = {
  translations: TranslationDict;
};

export function CookieWhatSection({ translations }: SectionProps) {
  return (
    <section id="what" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "what_are_cookies.title", "1. What Are Cookies?")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "what_are_cookies.desc",
          "Cookies are small text files stored on your device. They allow us to recognize your session, secure your payments, and analyze platform performance to improve the service.",
        )}
      </p>
    </section>
  );
}

export function CookieTypesSection({ translations }: SectionProps) {
  const cookies = [
    {
      key: "essential",
      title: "types.essential",
      desc: "types.essential_desc",
      defaultLabel: "Essential Cookies",
      defaultDesc: "Required for authentication (Neon Auth) and secure payment processing (Stripe). The service cannot function without these.",
    },
    {
      key: "analytics",
      title: "types.analytics",
      desc: "types.analytics_desc",
      defaultLabel: "Analytical Cookies",
      defaultDesc: "Provided by Google Analytics 4 (GA4). These help us understand how you use the builder and which features are most valuable.",
    },
    {
      key: "preference",
      title: "types.preference",
      desc: "types.preference_desc",
      defaultLabel: "Preference Cookies",
      defaultDesc: "Used to remember your UI settings, such as your preferred language and theme preferences.",
    },
  ];

  return (
    <section id="types" className="mb-16 scroll-mt-24 border-t border-border pt-12">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "types.title", "2. Specific Cookies We Use")}
      </h2>
      <div className="grid gap-6">
        {cookies.map((cookie) => (
          <div
            key={cookie.key}
            className="p-6 rounded-2xl bg-card border border-border shadow-sm flex gap-5"
          >
            <div className="w-2 h-auto rounded-full bg-primary/40" />
            <div>
              <h3 className="font-bold text-foreground mb-2">
                {resolveTranslation(translations, cookie.title, cookie.defaultLabel)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {resolveTranslation(translations, cookie.desc, cookie.defaultDesc)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CookieUsageSection({ translations }: SectionProps) {
  return (
    <section id="usage" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "usage.title", "3. Our Usage Policy")}
      </h2>
      <p className="mb-6 text-muted-foreground">
        {resolveTranslation(
          translations,
          "usage.current",
          "We use cookies to maintain your session via Neon Auth, process payments via Stripe, and understand platform usage via Google Analytics. Analytical cookies are only activated if you provide explicit consent through our cookie banner.",
        )}
      </p>
    </section>
  );
}

export function CookieManageSection({ translations }: SectionProps) {
  return (
    <section id="manage" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "manage.title", "4. Managing Your Preferences")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "manage.current",
          "You can withdraw your consent for analytical cookies at any time via the settings icon. Essential cookies required for security and account access cannot be disabled through our settings.",
        )}
      </p>
    </section>
  );
}

export function CookieThirdPartySection({ translations }: SectionProps) {
  return (
    <section id="third-party" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "third_party.title", "5. Third-Party Cookies")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "third_party.current",
          "We use Google Analytics (Google LLC) and Stripe (Stripe, Inc.) for analytics and payment security. These third parties may set cookies according to their own privacy policies. We do not use third-party advertising cookies.",
        )}
      </p>
    </section>
  );
}

export function CookieUpdatesSection({ translations }: SectionProps) {
  return (
    <section id="updates" className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "updates.title", "6. Policy Updates")}
      </h2>
      <p className="text-muted-foreground leading-relaxed">
        {resolveTranslation(
          translations,
          "updates.desc",
          "As we introduce new features, our use of cookies may evolve. Significant changes will be posted here.",
        )}
      </p>
    </section>
  );
}

export function CookieContactSection({ translations }: SectionProps) {
  return (
    <section id="contact" className="mb-16 scroll-mt-24 pt-10 border-t border-border">
      <h2 className="text-3xl font-display font-bold text-foreground pb-4">
        {resolveTranslation(translations, "contact.title", "7. Cookie Inquiries")}
      </h2>
      <div className="p-8 rounded-3xl bg-card border border-border shadow-lg">
        <p className="text-muted-foreground pb-4">
          {resolveTranslation(
            translations,
            "contact.desc",
            "For specific questions regarding our use of cookies, please contact:",
          )}
        </p>
        <a
          href="mailto:carles@rio-frances.com"
          className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold transition-transform hover:scale-105"
        >
          carles@rio-frances.com
        </a>
      </div>
    </section>
  );
}
