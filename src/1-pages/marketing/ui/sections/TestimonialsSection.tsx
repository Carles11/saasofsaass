import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface TestimonialsSectionProps {
  translations?: TranslationDict;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialsSection({ translations }: TestimonialsSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Testimonials");
  const title = resolveTranslation(translations, "title", "Trusted by professionals across industries");
  const subtitle = resolveTranslation(translations, "subtitle", "From social workers to wedding planners — here's what they say.");

  const testimonials = [
    {
      quote: resolveTranslation(
        translations,
        "testimonial.1.quote",
        "I added website management to my coaching offer overnight. Clients pay me for it and I don't have to touch the code.",
      ),
      author: resolveTranslation(translations, "testimonial.1.author", "Sara Méndez"),
      role: resolveTranslation(translations, "testimonial.1.role", "Business Coach"),
    },
    {
      quote: resolveTranslation(
        translations,
        "testimonial.2.quote",
        "Every family I work with gets a proper site in their language. The AI translation is genuinely impressive.",
      ),
      author: resolveTranslation(translations, "testimonial.2.author", "James Carter"),
      role: resolveTranslation(translations, "testimonial.2.role", "Social Worker"),
    },
    {
      quote: resolveTranslation(
        translations,
        "testimonial.3.quote",
        "I manage 14 client sites from one dashboard. My clients update their own content. Zero support calls.",
      ),
      author: resolveTranslation(translations, "testimonial.3.author", "Claudia Reyes"),
      role: resolveTranslation(translations, "testimonial.3.role", "Freelance Consultant"),
    },
  ];

  return (
    <section id="testimonials" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="flex flex-col gap-5 rounded-2xl border border-border/50 bg-card p-8 shadow-sm"
            >
              {/* Decorative quote mark */}
              <div
                className="text-5xl font-black leading-none text-primary/15 select-none"
                aria-hidden="true"
              >
                &ldquo;
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(t.author)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}