"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface ResellerFaqProps {
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
          open ? "max-h-72 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </dd>
    </div>
  );
}

export function ResellerFaq({ translations }: ResellerFaqProps) {
  const badge = resolveTranslation(translations, "faq.badge", "FAQ");
  const title = resolveTranslation(translations, "faq.title", "Questions about reselling");

  const faqs = [
    {
      q: resolveTranslation(translations, "faq.q1.q", "Can I resell the websites I build to my own clients?"),
      a: resolveTranslation(
        translations,
        "faq.q1.a",
        "Yes — that is exactly what the platform is for. You build sites under your account, set your own price, and bill your clients directly. Your subscription is a business cost; what you charge on top is yours to keep.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q2.q", "How much can I charge my clients?"),
      a: resolveTranslation(
        translations,
        "faq.q2.a",
        "You decide. Agencies and freelancers commonly charge €150–500 per month for a managed, multilingual website plus updates. Whatever you charge, you keep the difference after your plan — and a single Pro plan covers several client sites.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q3.q", "Which plan should I use to resell?"),
      a: resolveTranslation(
        translations,
        "faq.q3.a",
        "Most resellers start on Pro, which includes three published sites and lets you add more for a small fee per site. Once you are managing around ten or more client sites, Enterprise — with unlimited sites — becomes the cheaper option.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q4.q", "Do my clients need their own account?"),
      a: resolveTranslation(
        translations,
        "faq.q4.a",
        "No. You manage every client site from one dashboard. You can invite teammates with full access, or invite editors who can only update the content of a specific site — your clients never have to touch the builder unless you want them to.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q5.q", "Can each client site use its own custom domain?"),
      a: resolveTranslation(
        translations,
        "faq.q5.a",
        "Yes. On paid plans every site can run on its own custom domain, so each client gets a professional, branded web address rather than a shared subdomain.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q6.q", "Is multilingual included, or is it an extra cost?"),
      a: resolveTranslation(
        translations,
        "faq.q6.a",
        "Multilingual publishing is included on paid plans — add as many languages as a site needs with no per-language fee. It is one of the easiest things to upsell to clients who serve an international audience.",
      ),
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <section id="reseller-faq" className="px-6 py-24 md:py-32 bg-muted/30">
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
