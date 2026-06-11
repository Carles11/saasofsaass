import Link from "next/link";
import { ArrowRight, FileStack } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface StructuredVsAISectionProps {
  translations?: TranslationDict;
  locale: string;
}

export function StructuredVsAISection({ translations, locale }: StructuredVsAISectionProps) {
  const badge = resolveTranslation(translations, "badge", "Structure vs AI");
  const title = resolveTranslation(translations, "title", "Your website shouldn't start with a prompt");
  const description = resolveTranslation(
    translations,
    "description",
    "Most AI website builders can generate pages. You still need to figure out what those pages should be. SaaS of SaaS starts with proven structures and uses AI where it truly shines: content, translation, and localization.",
  );
  const cta = resolveTranslation(translations, "cta", "See the comparison");
  const slug = "structured-websites-vs-ai-generated-websites";

  return (
    <section id="structure-vs-ai" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${locale}/features/${slug}`}
          className="group relative block overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/5 via-background to-accent/5 p-10 md:p-14 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/25"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/6 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-accent/6 blur-3xl" />

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <FileStack className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{badge}</p>
                <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                {cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
