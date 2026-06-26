"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface StructuredVsAIFaqProps {
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

export function StructuredVsAIFaq({ translations }: StructuredVsAIFaqProps) {
  const badge = resolveTranslation(translations, "faq.badge", "FAQ");
  const title = resolveTranslation(translations, "faq.title", "Questions about structured vs AI websites");

  const faqs = [
    {
      q: resolveTranslation(translations, "faq.q1.q", "Why not let AI create my whole website?"),
      a: resolveTranslation(
        translations,
        "faq.q1.a",
        "AI is excellent at generating text, but it struggles with consistent architecture, navigation logic, conversion flow, and multilingual structure. A website that changes every time you add content risks confusing visitors and losing SEO rankings. SaaS of SaaS gives you a fixed, predictable structure while AI handles the content layer.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q2.q", "Can I still use AI inside SaaS of SaaS?"),
      a: resolveTranslation(
        translations,
        "faq.q2.a",
        "Absolutely. AI is built into the platform for content generation, rewriting, translation, and tone adjustment. The difference is that AI improves the content within a proven architecture, rather than inventing a new structure each time.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q3.q", "Is structured architecture better for SEO?"),
      a: resolveTranslation(
        translations,
        "faq.q3.a",
        "Yes. Search engines and AI crawlers prefer predictable, well-organized websites. Consistent URL patterns, clear heading hierarchies, stable navigation, and proper metadata all contribute to better indexing and higher rankings.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q4.q", "What is GEO optimization?"),
      a: resolveTranslation(
        translations,
        "faq.q4.a",
        "Generative Engine Optimization (GEO) means optimizing your website so AI search systems like ChatGPT, Perplexity, and Gemini can understand and accurately represent your content. Structured data, clear hierarchies, and multilingual architecture are key factors.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q5.q", "How does multilingual publishing work?"),
      a: resolveTranslation(
        translations,
        "faq.q5.a",
        "Select any of our 8 supported languages and AI translates your entire site automatically. The multilingual structure, including hreflang tags and locale-specific URLs, is built into the platform. You don't need to configure anything.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q6.q", "Can AI search engines understand my website better?"),
      a: resolveTranslation(
        translations,
        "faq.q6.a",
        "Yes. AI search systems parse structured content more accurately. When your website has clear navigation, semantic headings, proper metadata, and consistent multilingual architecture, AI models can extract, summarize, and present your content with higher confidence.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q7.q", "Do I need prompt engineering skills?"),
      a: resolveTranslation(
        translations,
        "faq.q7.a",
        "Not at all. Unlike AI-first website builders where you must craft detailed prompts to get usable results, SaaS of SaaS provides predefined structures. You describe what you need, and the AI enhances the content within a fixed architecture. No prompt expertise required.",
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
    <section id="structure-vs-ai-faq" className="px-6 py-24 md:py-32 bg-muted/30">
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
