import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface FaqSectionProps {
  translations?: TranslationDict;
}

export function FaqSection({ translations }: FaqSectionProps) {
  const badge = resolveTranslation(translations, "badge", "FAQ");
  const title = resolveTranslation(translations, "title", "Frequently Asked");
  const faqs = [
    {
      q: resolveTranslation(
        translations,
        "q1.question",
        "What is a multi-tenant website factory?",
      ),
      a: resolveTranslation(
        translations,
        "q1.answer",
        "It means you run one platform that serves many clients. Each client gets their own branded, multilingual site — but you manage everything from a single dashboard.",
      ),
    },
    {
      q: resolveTranslation(translations, "q2.question", "Do my clients need to code?"),
      a: resolveTranslation(
        translations,
        "q2.answer",
        "No. Your clients edit content through a simple interface. They never touch code, layout, or settings.",
      ),
    },
    {
      q: resolveTranslation(translations, "q3.question", "How do AI translations work?"),
      a: resolveTranslation(
        translations,
        "q3.answer",
        "Enable a language for any tenant. Gemini 2.5 translates every block and piece of content automatically. You can review and edit before publishing.",
      ),
    },
    {
      q: resolveTranslation(translations, "q4.question", "Can I use my own domain?"),
      a: resolveTranslation(
        translations,
        "q4.answer",
        "Yes. Every tenant can have a custom domain or a subdomain. DNS setup is handled through your dashboard.",
      ),
    },
    {
      q: resolveTranslation(translations, "q5.question", "Is there a free trial?"),
      a: resolveTranslation(
        translations,
        "q5.answer",
        "Yes. Start with the Starter plan and build up to 3 sites at no cost during the trial period.",
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
