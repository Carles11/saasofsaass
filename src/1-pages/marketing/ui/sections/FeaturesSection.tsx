import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { Layers, Users, Languages, Palette, Globe, Zap } from "lucide-react";

const FEATURE_DEFS = [
  {
    id: "multi-tenant",
    icon: Layers,
    fallbackTitle: "One platform, unlimited clients",
    fallbackDescription:
      "Create a separate website for every client you have. Each one is fully isolated — its own content, branding, and languages. Add a new client in minutes.",
  },
  {
    id: "role-based",
    icon: Users,
    fallbackTitle: "You control the structure",
    fallbackDescription:
      "Set up the site once. Then invite your client as an editor so they can update text, photos, and blog posts — without ever touching layout or settings.",
  },
  {
    id: "ai-translations",
    icon: Languages,
    fallbackTitle: "Go multilingual in one click",
    fallbackDescription:
      "Enable any language and let AI translate the entire site automatically. Perfect if your clients serve diverse communities or operate across borders.",
  },
  {
    id: "templates",
    icon: Palette,
    fallbackTitle: "Pre-built templates",
    fallbackDescription:
      "Choose a professional layout for each client. You can customize branding, colors, and fonts to match their identity.",
  },
  {
    id: "domains",
    icon: Globe,
    fallbackTitle: "Custom domains included",
    fallbackDescription:
      "Every client gets a free subdomain to start. Connect their own domain in minutes — SSL and hosting included.",
  },
  {
    id: "no-code",
    icon: Zap,
    fallbackTitle: "Let your clients take over",
    fallbackDescription:
      "Once you hand over the keys, clients manage their own content. No training needed, no more support calls about broken layouts.",
  },
];

interface FeaturesSectionProps {
  translations?: TranslationDict;
}

export function FeaturesSection({ translations }: FeaturesSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Features");
  const title = resolveTranslation(translations, "title", "Built for the rest of us");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "A full website factory for non-technical professionals. No code, no stress, no overhead.",
  );

  const features = FEATURE_DEFS.map((feature) => ({
    icon: feature.icon,
    title: resolveTranslation(translations, `${feature.id}.title`, feature.fallbackTitle),
    description: resolveTranslation(translations, `${feature.id}.description`, feature.fallbackDescription),
  }));

  return (
    <section id="features" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-background hover:bg-muted/40 transition-colors duration-200 p-8 flex flex-col gap-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}