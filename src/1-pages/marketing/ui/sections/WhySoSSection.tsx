import Link from "next/link";
import { ArrowRight, Globe, TrendingUp, FileStack } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface WhySoSSectionProps {
  translations?: TranslationDict;
  locale: string;
}

const CARDS = [
  {
    key: "multilingual",
    icon: Globe,
    slug: "multilingual-website-builder",
  },
  {
    key: "reseller",
    icon: TrendingUp,
    slug: "earn-by-reselling-websites",
  },
  {
    key: "structured",
    icon: FileStack,
    slug: "structured-websites-vs-ai-generated-websites",
  },
] as const;

export function WhySoSSection({ translations, locale }: WhySoSSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Why SofS?");
  const title = resolveTranslation(translations, "title", "Built for agencies who build for clients");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Three reasons freelancers and agencies choose SaaS of SaaS over every other website builder.",
  );

  return (
    <section id="why-sos" className="relative overflow-hidden px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/4 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/4 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map(({ key, icon: Icon, slug }) => (
            <Link
              key={key}
              href={`/${locale}/features/${slug}`}
              className="group relative flex flex-col rounded-2xl border border-border/40 bg-card p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/25 hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-5">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {resolveTranslation(translations, `card.${key}.title`, "")}
              </h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                {resolveTranslation(translations, `card.${key}.desc`, "")}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                {resolveTranslation(translations, `card.${key}.cta`, "")}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
