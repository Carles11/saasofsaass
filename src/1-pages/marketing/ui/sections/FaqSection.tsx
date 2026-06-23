"use client";

import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqSectionProps {
  translations?: TranslationDict;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
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
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-64 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FaqSection({ translations }: FaqSectionProps) {
  const badge = resolveTranslation(translations, "badge", "FAQ");
  const title = resolveTranslation(
    translations,
    "title",
    "Questions professionals ask",
  );

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
        "Not at all. If you can use a word processor, you can use SofS. You set up the site structure once using our visual builder, and your client handles everything after that.",
      ),
    },
    {
      q: resolveTranslation(
        translations,
        "q2.question",
        "How does my client edit their site?",
      ),
      a: resolveTranslation(
        translations,
        "q2.answer",
        "You invite them as an editor. They get a clean, simple dashboard where they can update text, upload images, and write blog posts — without being able to break anything.",
      ),
    },
    {
      q: resolveTranslation(
        translations,
        "q3.question",
        "Can I offer this as part of my services?",
      ),
      a: resolveTranslation(
        translations,
        "q3.answer",
        "Absolutely. Many of our users charge their clients a monthly fee for website management. SofS works behind the scenes — your client just sees a site that looks like yours.",
      ),
    },
    {
      q: resolveTranslation(
        translations,
        "q4.question",
        "What languages can a site be in?",
      ),
      a: resolveTranslation(
        translations,
        "q4.answer",
        "We support 8 languages: English, Spanish, Catalan, French, German, Italian, Basque, and Galician. Add a new language in one click and AI translates everything automatically.",
      ),
    },
    {
      q: resolveTranslation(
        translations,
        "q5.question",
        "Can each client have their own domain?",
      ),
      a: resolveTranslation(
        translations,
        "q5.answer",
        "Yes. Every site gets a free subdomain to start, and you can connect a custom domain from your dashboard in minutes.",
      ),
    },
  ];

  return (
    <section id="faq" className="px-6 py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            {badge}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        </div>

        {/* Accordion */}
        <div className="rounded-2xl border border-border/50 bg-card px-6 divide-y divide-border/0">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
