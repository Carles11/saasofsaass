import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  translations?: TranslationDict;
  locale?: string;
}

export function HeroSection({ translations, locale }: HeroSectionProps) {
  // const badge = resolveTranslation(translations, "badge", "Now in public beta — join free");
  const titleLine1 = resolveTranslation(
    translations,
    "title.line1",
    "The truly free,",
  );
  const titleLine2 = resolveTranslation(
    translations,
    "title.line2",
    "multilingual website builder.",
  );
  const titleAccent = resolveTranslation(
    translations,
    "title.accent",
    "Build once. Resell forever.",
  );
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "SoSS is the truly free website builder: build unlimited professional, multilingual websites for your clients — each with its own custom domain on every plan, including Free. No code. Set up the structure once, let clients edit the content forever, or resell sites as a managed service.",
  );
  const startBuilding = resolveTranslation(
    translations,
    "cta.start-building",
    "Start for Free",
  );
  const seeHow = resolveTranslation(
    translations,
    "cta.see-how",
    "See how it works",
  );

  const stats = [
    {
      value: "20+",
      label: resolveTranslation(translations, "stat.sites", "Sites launched"),
    },
    {
      value: "8",
      label: resolveTranslation(
        translations,
        "stat.languages",
        "Languages supported",
      ),
    },
    {
      value: "99.9%",
      label: resolveTranslation(translations, "stat.uptime", "Uptime"),
    },
    {
      value: "0",
      label: resolveTranslation(translations, "stat.code", "Lines of code"),
    },
  ];

  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-36 md:pb-28">
      {/* Very subtle background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-10">
          {badge}
        </div> */}

        {/* Headline — large, generous, editorial feel */}
        <h1 className="text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-6xl md:text-7xl">
          {titleLine1}
          <br />
          <span className="text-foreground/80">{titleLine2}</span>
          <br />
          <span className="text-primary">{titleAccent}</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="px-8 h-12 text-base">
            <Link href={appAuthUrl("sign-up", locale ?? "en")}>
              {startBuilding}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="px-8 h-12 text-base border-border/60"
          >
            <Link href="#how-it-works">{seeHow}</Link>
          </Button>
        </div>

        {/* Stats — clean horizontal divider row, no card boxes */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/40 border border-border/40 rounded-2xl overflow-hidden bg-card/50">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-6 px-4"
            >
              <span className="text-3xl font-bold text-foreground md:text-4xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-muted-foreground tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
