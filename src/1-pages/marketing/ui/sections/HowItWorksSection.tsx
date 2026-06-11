import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { FileText, UserPlus, Languages, Rocket } from "lucide-react";

interface HowItWorksSectionProps {
  translations?: TranslationDict;
}

const STEPS = [
  {
    id: "step.1",
    icon: FileText,
    fallbackTitle: "Choose a template",
    fallbackDescription:
      "Pick a layout. Customize colors and fonts. Add your client's logo. You're done.",
  },
  {
    id: "step.2",
    icon: UserPlus,
    fallbackTitle: "Invite your client",
    fallbackDescription:
      "Add them as an editor of their site. They can add pages, write posts, and upload images on their own.",
  },
  {
    id: "step.3",
    icon: Languages,
    fallbackTitle: "Set up languages",
    fallbackDescription:
      "Toggle any of our 8 supported languages. AI translates everything — text, blog posts, menus — automatically.",
  },
  {
    id: "step.4",
    icon: Rocket,
    fallbackTitle: "Go live",
    fallbackDescription:
      "Your client gets a branded subdomain (or their own domain). You bill them monthly. We handle the rest.",
  },
];

export function HowItWorksSection({ translations }: HowItWorksSectionProps) {
  const badge = resolveTranslation(translations, "badge", "How It Works");
  const title = resolveTranslation(translations, "title", "Turn website management into a revenue stream");
  const subtitle = resolveTranslation(translations, "subtitle", "You don't need a team of developers. Just a client who needs a site.");

  const steps = STEPS.map((step) => ({
    icon: step.icon,
    title: resolveTranslation(translations, `${step.id}.title`, step.fallbackTitle),
    description: resolveTranslation(translations, `${step.id}.description`, step.fallbackDescription),
  }));

  return (
    <section id="how-it-works" className="px-4 py-16 md:py-24">
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
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </div>
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shrink-0 z-10">
                  <span className="text-sm font-bold text-foreground">{i + 1}</span>
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
