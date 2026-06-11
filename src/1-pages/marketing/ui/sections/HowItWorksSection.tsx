import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { FileText, UserPlus, Languages, Rocket } from "lucide-react";

interface HowItWorksSectionProps {
  translations?: TranslationDict;
}

const STEPS = [
  {
    id: "step.1",
    number: "01",
    icon: FileText,
    fallbackTitle: "Choose a template",
    fallbackDescription: "Pick a layout. Customize colors and fonts. Add your client's logo. You're done.",
  },
  {
    id: "step.2",
    number: "02",
    icon: UserPlus,
    fallbackTitle: "Invite your client",
    fallbackDescription: "Add them as an editor. They can write posts and upload images on their own — no training needed.",
  },
  {
    id: "step.3",
    number: "03",
    icon: Languages,
    fallbackTitle: "Set up languages",
    fallbackDescription: "Toggle any of our 8 supported languages. AI translates everything automatically.",
  },
  {
    id: "step.4",
    number: "04",
    icon: Rocket,
    fallbackTitle: "Go live",
    fallbackDescription: "Your client gets a branded subdomain or their own domain. You bill them monthly. We handle the rest.",
  },
];

export function HowItWorksSection({ translations }: HowItWorksSectionProps) {
  const badge = resolveTranslation(translations, "badge", "How It Works");
  const title = resolveTranslation(translations, "title", "Turn website management into a revenue stream");
  const subtitle = resolveTranslation(translations, "subtitle", "You don't need a team of developers. Just a client who needs a site.");

  const steps = STEPS.map((step) => ({
    number: step.number,
    icon: step.icon,
    title: resolveTranslation(translations, `${step.id}.title`, step.fallbackTitle),
    description: resolveTranslation(translations, `${step.id}.description`, step.fallbackDescription),
  }));

  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Steps grid — 4 columns desktop, 1 column mobile */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col">
              {/* Step number as large background element */}
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-4xl font-black text-border/60 leading-none mt-1 select-none">
                  {step.number}
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}