"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface MultilingualFaqProps {
  translations?: TranslationDict;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <dt>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between py-5 text-left gap-4 group"
          aria-expanded={open}
        >
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
            {question}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </dt>
      <dd
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-64 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </dd>
    </div>
  );
}

export function MultilingualFaq({ translations }: MultilingualFaqProps) {
  const badge = resolveTranslation(translations, "faq.badge", "FAQ");
  const title = resolveTranslation(translations, "faq.title", "Questions about multilingual sites");

  const faqs = [
    {
      q: resolveTranslation(translations, "faq.q1.q", "How does a visitor get the site in their own language?"),
      a: resolveTranslation(
        translations,
        "faq.q1.a",
        "Each visitor is served the language version that matches their browser, with proper hreflang tags telling search engines which version to show in which country. There is no clunky language-selector to hunt for — the right language simply arrives.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q2.q", "Do I have to translate every page by hand?"),
      a: resolveTranslation(
        translations,
        "faq.q2.a",
        "No. Add a language and the platform translates every block and page automatically using AI. You can review and refine any text afterwards, but you never start from a blank page — and you never hire a translator just to launch.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q3.q", "Which languages are supported?"),
      a: resolveTranslation(
        translations,
        "faq.q3.a",
        "English, Spanish, Catalan, Basque, Galician, French, Italian, and German — each with locale-specific URLs and native rendering. More languages are added over time, and every site you build can use any of them.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q4.q", "Does adding a language cost extra?"),
      a: resolveTranslation(
        translations,
        "faq.q4.a",
        "Not on paid plans. Unlike builders that charge a monthly fee per language, multilingual publishing is included — add as many languages as a site needs without a per-locale surcharge.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q5.q", "Is a multilingual site better for SEO?"),
      a: resolveTranslation(
        translations,
        "faq.q5.a",
        "Yes. Each language version gets its own crawlable URL and correct hreflang annotations, so search engines and AI answer engines index the right version for each audience instead of treating translations as duplicate content.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q6.q", "Can I offer multilingual sites to my own clients?"),
      a: resolveTranslation(
        translations,
        "faq.q6.a",
        "That is exactly who this is built for. Manage every client site from one dashboard, deliver each one in the languages its audience speaks, and charge for a premium capability that would otherwise require a translator and custom development.",
      ),
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <section id="multilingual-faq" className="px-6 py-24 md:py-32 bg-muted/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        </div>

        <dl className="rounded-2xl border border-border/50 bg-card px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </dl>
      </div>
    </section>
  );
}
