import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

const TESTIMONIALS = [
  {
    quote: "We launched 12 client sites in a weekend. The multi-tenant setup is a game changer.",
    author: "Maria López",
    role: "Agency Owner",
  },
  {
    quote: "AI translations alone saved us months of work. Our clients love having their sites in 8 languages.",
    author: "James Carter",
    role: "Freelance Designer",
  },
  {
    quote: "My editors can update content without breaking the design. Zero support calls since launch.",
    author: "Aiko Tanaka",
    role: "Digital Agency Lead",
  },
];

interface TestimonialsSectionProps {
  translations?: TranslationDict;
}

export function TestimonialsSection({ translations }: TestimonialsSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Testimonials");
  const title = resolveTranslation(translations, "title", "Loved by Builders");

  return (
    <section id="testimonials" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{badge}</Badge>
          <h2 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
            {title}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
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
