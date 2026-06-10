import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users, Languages, Palette, Globe, Zap } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

const FEATURE_DEFS = [
  {
    id: "multi-tenant",
    icon: Layers,
    fallbackTitle: "Multi-Tenant",
    fallbackDescription:
      "Spin up a new site for every client. Fully isolated with its own branding, content, and languages.",
  },
  {
    id: "role-based",
    icon: Users,
    fallbackTitle: "Role-Based Access",
    fallbackDescription:
      "You control the structure. Invite editors to manage content without touching layout or settings.",
  },
  {
    id: "ai-translations",
    icon: Languages,
    fallbackTitle: "AI Translations",
    fallbackDescription:
      "One click translates your entire site. Enable any language and let Gemini handle the rest.",
  },
  {
    id: "templates",
    icon: Palette,
    fallbackTitle: "Category Templates",
    fallbackDescription:
      "Social work, wedding, and more — each category has purpose-built blocks and layouts.",
  },
  {
    id: "domains",
    icon: Globe,
    fallbackTitle: "Custom Domains",
    fallbackDescription:
      "Every tenant gets a subdomain or a custom domain of their own. Full DNS support included.",
  },
  {
    id: "no-code",
    icon: Zap,
    fallbackTitle: "No Code",
    fallbackDescription:
      "Your clients edit content through a clean dashboard. No coding, no confusion, no support tickets.",
  },
];

interface FeaturesSectionProps {
  translations?: TranslationDict;
}

export function FeaturesSection({ translations }: FeaturesSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Features");
  const title = resolveTranslation(translations, "title", "Everything You Need");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "From multi-tenant isolation to AI-powered translations — built for agencies and freelancers.",
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
