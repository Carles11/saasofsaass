"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface SeoGeoFaqProps {
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
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${open ? "max-h-64 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function SeoGeoFaq({ translations }: SeoGeoFaqProps) {
  const badge = resolveTranslation(translations, "faq.badge", "FAQ");
  const title = resolveTranslation(translations, "faq.title", "Questions about SEO & GEO for tenant sites");

  const faqs = [
    {
      q: resolveTranslation(translations, "faq.q1.q", "Are tenant sites automatically indexed by Google?"),
      a: resolveTranslation(
        translations,
        "faq.q1.a",
        "Only on Pro and Enterprise plans. Each tenant site has per-locale metadata, hreflang tags, a canonical URL pointing to its primary domain, and an auto-generated sitemap. Free sites are intentionally marked noindex to protect your domain reputation — they remain accessible via subdomain but will not appear in search results.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q2.q", "What structured data do tenant sites emit?"),
      a: resolveTranslation(
        translations,
        "faq.q2.a",
        "The homepage emits Organization and WebSite schema. Blog posts emit Article schema with headline, description, author, publish date, and publisher. Podcast episodes emit PodcastEpisode schema. The Map block emits LocalBusiness schema. All structured data is valid JSON-LD and is only emitted on indexed (paid) sites.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q3.q", "What is GEO and why does it matter?"),
      a: resolveTranslation(
        translations,
        "faq.q3.a",
        "Generative Engine Optimization (GEO) means optimizing your site so AI answer engines like ChatGPT, Perplexity, and Gemini can understand and accurately represent your content. Structured data (JSON-LD), semantic HTML, clear heading hierarchies, and multilingual architecture are the key factors. Tenant sites use all of these by default.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q4.q", "Can each tenant site have its own custom domain?"),
      a: resolveTranslation(
        translations,
        "faq.q4.a",
        "Yes. Pro and Enterprise plans support custom domains per tenant. When a verified custom domain is connected, all canonical URLs, sitemap entries, and structured data references point to that domain instead of the subdomain. This prevents duplicate content between the subdomain and the custom domain.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q5.q", "Does the sitemap include all tenant sites?"),
      a: resolveTranslation(
        translations,
        "faq.q5.a",
        "The platform sitemap at /sitemap.xml includes every active, indexable tenant site. Each tenant also benefits from automatic locale-specific hreflang links so the correct language version appears in search results. Free sites are excluded from the sitemap.",
      ),
    },
    {
      q: resolveTranslation(translations, "faq.q6.q", "What happens when a Free tenant upgrades to Pro?"),
      a: resolveTranslation(
        translations,
        "faq.q6.a",
        "The site automatically becomes indexable — the noindex tag is removed, the sitemap entry is added, and JSON-LD structured data begins emitting on the homepage and all content pages. Existing content does not need to be regenerated. Downgrading back to Free reverses this: the site is marked noindex again.",
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
    <section id="seo-geo-faq" className="px-6 py-24 md:py-32 bg-muted/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h2>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card px-6">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
