import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface CtaSectionProps {
  translations?: TranslationDict;
}

export function CtaSection({ translations }: CtaSectionProps) {
  const title = resolveTranslation(translations, "title", "Ready to add websites to your services?");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Set up your first client site in under 20 minutes. No credit card, no developer, no nonsense.",
  );
  const getStarted = resolveTranslation(translations, "cta.get-started", "Create your free account");
  const talkSales = resolveTranslation(translations, "cta.talk-sales", "Book a demo");

  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="rounded-2xl bg-linear-to-br from-primary/10 via-background to-accent/10 border border-border p-8 md:p-12">
          <h2 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                {getStarted}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">{talkSales}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
