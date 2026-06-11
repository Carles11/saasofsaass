import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface FaqSectionProps {
  translations?: TranslationDict;
}

export function FaqSection({ translations }: FaqSectionProps) {
  const badge = resolveTranslation(translations, "badge", "FAQ");
  const title = resolveTranslation(translations, "title", "Questions professionals ask");
  const faqs = [
    {
      q: resolveTranslation(
        translations,
        "q1.question",
        "Do I need to be a developer to use this?",
      ),
      a: resolveTranslation(
        translations,
        "q1.answer",
        "Not at all. If you can use a word processor, you can use SoSS. You set up the site structure once using our visual builder, and your client handles everything after that.",
      ),
    },
    {
      q: resolveTranslation(translations, "q2.question", "How does my client edit their site?"),
      a: resolveTranslation(
        translations,
        "q2.answer",
        "You invite them as an editor. They get a clean, simple dashboard where they can update text, upload images, and write blog posts — without being able to break anything.",
      ),
    },
    {
      q: resolveTranslation(translations, "q3.question", "Can I offer this as part of my services?"),
      a: resolveTranslation(
        translations,
        "q3.answer",
        "Absolutely. Many of our users charge their clients a monthly fee for website management. SoSS works behind the scenes — your client just sees a site that looks like yours.",
      ),
    },
    {
      q: resolveTranslation(translations, "q4.question", "What languages can a site be in?"),
      a: resolveTranslation(
        translations,
        "q4.answer",
        "We support 8 languages out of the box: English, Spanish, Catalan, French, German, Italian, Basque, and Galician. Add a new language in one click and AI translates everything automatically.",
      ),
    },
    {
      q: resolveTranslation(translations, "q5.question", "Can each client have their own domain?"),
      a: resolveTranslation(
        translations,
        "q5.answer",
        "Yes. Every site gets a free subdomain to start, and you can connect a custom domain from your dashboard in minutes.",
      ),
    },
  ];

  return (
    <section id="faq" className="px-4 py-16 md:py-24 bg-muted/50">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{badge}</Badge>
          <h2 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
            {title}
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-card p-4 open:shadow-sm transition-shadow"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-foreground text-sm">{faq.q}</span>
                <svg
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
