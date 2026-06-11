import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users, Languages, Palette, Globe, Zap } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

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
    title: resolveTranslation(
      translations,
      `${feature.id}.title`,
      feature.fallbackTitle,
    ),
    description: resolveTranslation(
      translations,
      `${feature.id}.description`,
      feature.fallbackDescription,
    ),
  }));

  return (
    <section id="features" className="px-4 py-16 md:py-24">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
