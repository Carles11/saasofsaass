import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CtaSectionProps {
  translations?: TranslationDict;
}

export function CtaSection({ translations }: CtaSectionProps) {
  const title = resolveTranslation(
    translations,
    "title",
    "Ready to add websites to your services?",
  );
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Set up your first client site in under 20 minutes. No credit card, no developer, no nonsense.",
  );
  const getStarted = resolveTranslation(
    translations,
    "cta.get-started",
    "Create your free account",
  );
  // const talkSales = resolveTranslation(
  //   translations,
  //   "cta.talk-sales",
  //   "Book a demo",
  // );

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl ">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 via-background to-accent/8 p-12 md:p-16 text-center ">
          {/* Soft decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/8 blur-3xl" />

          <h2 className="relative text-3xl font-extrabold tracking-tight text-foreground md:text-4xl ">
            {title}
          </h2>
          <p className="relative mt-4 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="default"
              size="lg"
              asChild
              className="px-8 h-12 text-base"
            >
              <Link href="/">
                {getStarted}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {/* <Button variant="outline" size="lg" asChild className="px-8 h-12 text-base border-border/60">
              <Link href="#faq">{talkSales}</Link>
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
}
