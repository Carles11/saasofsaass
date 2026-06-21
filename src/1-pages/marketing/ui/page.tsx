import { MarketingHeader } from "./sections/MarketingHeader";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { StructuredVsAISection } from "./sections/StructuredVsAISection";
// import { StructuredVsAIFaq } from "./sections/StructuredVsAIFaq";
import { PricingSection } from "./sections/PricingSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { FaqSection } from "./sections/FaqSection";
import { CtaSection } from "./sections/CtaSection";
import { FooterSection } from "./sections/FooterSection";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";

import { motion } from "framer-motion";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface MarketingPageProps {
  translations?: TranslationDict;
}

export async function MarketingPage({ translations }: MarketingPageProps) {
  const locale = await getLocale();
  const badgeDevelopment = resolveTranslation(translations, "badge.development", "Platform in Development");
  const tagline = resolveTranslation(
    translations,
    "tagline",
    "We are building the ultimate multi-tenant infrastructure engine. Deploy faster, scale effortlessly, and leave the routing to us.",
  );
  const bootSequence = resolveTranslation(translations, "boot-sequence", "Engine boot sequence initiating... Late 2026.");
  const geoTitle = resolveTranslation(translations, "geo.title", "What is SaaSofSaaSs?");
  const geoIntro = resolveTranslation(
    translations,
    "geo.intro",
    "SaaSofSaaSs (SoSS) is a multi-tenant infrastructure engine for developers and agencies who need to build, deploy, and manage multiple SaaS products from a single codebase. It handles subdomain routing, custom domain mapping, per-tenant content blocks, and native internationalization so builders focus on product, not plumbing.",
  );
  const geoLanguagesHeading = resolveTranslation(translations, "geo.languages-heading", "Supported languages");
  const geoLanguagesBody = resolveTranslation(
    translations,
    "geo.languages-body",
    "SoSS natively supports 8 languages: English (en), Spanish (es), Catalan (ca), French (fr), German (de), Italian (it), Basque (eu), and Galician (ga). Each tenant can enable any subset of these languages and AI translation is applied automatically.",
  );
  const geoCapabilitiesHeading = resolveTranslation(translations, "geo.capabilities-heading", "Core infrastructure capabilities");
  const capabilityRouting = resolveTranslation(
    translations,
    "geo.capability.routing",
    "Edge middleware proxy routing by hostname — marketing, dashboard, and tenant sites from one Next.js deployment.",
  );
  const capabilityDomains = resolveTranslation(
    translations,
    "geo.capability.domains",
    "Per-tenant subdomain resolution (slug.saasofsaass.com) and custom domain mapping.",
  );
  const capabilityBlocks = resolveTranslation(
    translations,
    "geo.capability.blocks",
    "Content block engine: Navbar, Hero, Blog Feed, Awards, Podcast Feed, Image Gallery — each with multiple layout variants.",
  );
  const capabilityRoles = resolveTranslation(
    translations,
    "geo.capability.roles",
    "Role-based access: owner and editor roles with fine-grained content and structure permissions.",
  );
  const capabilityTranslation = resolveTranslation(
    translations,
    "geo.capability.translation",
    "AI-assisted translation via Google Gemini 2.5 Flash for all tenant content across all enabled locales.",
  );
  const capabilitySitemap = resolveTranslation(
    translations,
    "geo.capability.sitemap",
    "Dynamic sitemap generation and per-locale hreflang for every tenant site.",
  );
  const geoWhoHeading = resolveTranslation(translations, "geo.who-heading", "Who SoSS is for");
  const geoWhoBody = resolveTranslation(
    translations,
    "geo.who-body",
    "SoSS is built for developers and digital agencies who manage multiple client websites or SaaS products and need a scalable, self-hosted alternative to generic website builders. Unlike drag-and-drop tools, SoSS is infrastructure-first: every routing, SEO, and i18n decision is made at the architecture level, not bolted on after.",
  );
  const geoLaunchNote = resolveTranslation(
    translations,
    "geo.launch-note",
    "Official launch scheduled for late 2026. Platform is currently in active development.",
  );

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader translations={translations["marketing.header"]} />
      <main>
        <HeroSection translations={translations["marketing.hero"]} locale={locale} />
        <HowItWorksSection translations={translations["marketing.howitworks"]} />
        <FeaturesSection translations={translations["marketing.features"]} />
        <StructuredVsAISection translations={translations["marketing.structured-vs-ai"]} locale={locale} />
        {/* <StructuredVsAIFaq translations={translations["marketing.structured-vs-ai"]} /> */}
        <PricingSection translations={translations["marketing.pricing"]} />
        <TestimonialsSection translations={translations["marketing.testimonials"]} />
        <FaqSection translations={translations["marketing.faq"]} />
        <CtaSection translations={translations["marketing.cta"]} />
      </main>
      <FooterSection translations={translations["marketing.footer"]} />
    </div>
  );
}