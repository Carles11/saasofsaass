import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface TestimonialsSectionProps {
  translations?: TranslationDict;
}

export function TestimonialsSection({ translations }: TestimonialsSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Testimonials");
  const title = resolveTranslation(translations, "title", "Trusted by professionals across industries");
  const subtitle = resolveTranslation(translations, "subtitle", "From social workers to wedding planners — here's what they say.");

  const testimonials = [
    {
      quote: resolveTranslation(translations, "testimonial.1.quote", "I added website management to my coaching offer overnight. Clients pay me for it and I don't have to touch the code."),
      author: resolveTranslation(translations, "testimonial.1.author", "Sara Méndez"),
      role: resolveTranslation(translations, "testimonial.1.role", "Business Coach"),
    },
    {
      quote: resolveTranslation(translations, "testimonial.2.quote", "Every family I work with gets a proper site in their language. The AI translation is genuinely impressive."),
      author: resolveTranslation(translations, "testimonial.2.author", "James Carter"),
      role: resolveTranslation(translations, "testimonial.2.role", "Social Worker"),
    },
    {
      quote: resolveTranslation(translations, "testimonial.3.quote", "I manage 14 client sites from one dashboard. My clients update their own content. Zero support calls."),
      author: resolveTranslation(translations, "testimonial.3.author", "Claudia Reyes"),
      role: resolveTranslation(translations, "testimonial.3.role", "Freelance Consultant"),
    },
  ];

  return (
    <section id="testimonials" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{badge}</Badge>
                <h2 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed mb-4">&quot;{t.quote}&quot;</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
