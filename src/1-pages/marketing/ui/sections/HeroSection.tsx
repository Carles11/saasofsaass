import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface HeroSectionProps {
  translations?: TranslationDict;
  locale?: string;
}

export function HeroSection({ translations, locale }: HeroSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Now in public beta — join free");
  const titleLine1 = resolveTranslation(translations, "title.line1", "Create Professional");
  const titleLine2 = resolveTranslation(translations, "title.line2", "Websites");
  const titleAccent = resolveTranslation(translations, "title.accent", "For Anyone.");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Offer branded, multilingual websites to every client you work with — without hiring a developer or learning to code. You set it up once. They update it forever.",
  );
  const startBuilding = resolveTranslation(translations, "cta.start-building", "Start for Free");
  const seeHow = resolveTranslation(translations, "cta.see-how", "See how it works");

  const stats = [
    {
      value: "50+",
      label: resolveTranslation(translations, "stat.sites", "Sites Built"),
    },
    {
      value: "8",
      label: resolveTranslation(translations, "stat.languages", "Languages"),
    },
    {
      value: "99.9%",
      label: resolveTranslation(translations, "stat.uptime", "Uptime"),
    },
    {
      value: "Zero",
      label: resolveTranslation(translations, "stat.code", "Code Required"),
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
          🚀 {badge}
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
          {titleLine1}
          <br />
          {titleLine2}{" "}
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {titleAccent}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href={`/${locale}/auth/sign-up`}>
              {startBuilding}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">{seeHow}</Link>
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-foreground md:text-3xl">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
