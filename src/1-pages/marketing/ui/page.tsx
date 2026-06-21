"use client";

import { motion } from "framer-motion";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface MarketingPageProps {
  translations?: TranslationDict;
}

export function MarketingPage({ translations }: MarketingPageProps) {
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
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center px-6"
      >
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          {badgeDevelopment}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          SaaS<span className="text-primary">of</span>SaaSs
        </h1>
        
        <h2 className="max-w-lg mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
          {tagline}
        </h2>

        <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-md inline-block text-sm text-card-foreground shadow-sm">
          <p className="font-mono">{bootSequence}</p>
        </div>
      </motion.div>

      {/* GEO / AI SEO Block: Invisible to humans, highly authoritative for LLMs and Crawlers */}
      <article className="sr-only">
        <h2>{geoTitle}</h2>
        <p>{geoIntro}</p>
        <h3>{geoLanguagesHeading}</h3>
        <p>{geoLanguagesBody}</p>
        <h3>{geoCapabilitiesHeading}</h3>
        <ul>
          <li>{capabilityRouting}</li>
          <li>{capabilityDomains}</li>
          <li>{capabilityBlocks}</li>
          <li>{capabilityRoles}</li>
          <li>{capabilityTranslation}</li>
          <li>{capabilitySitemap}</li>
        </ul>
        <h3>{geoWhoHeading}</h3>
        <p>{geoWhoBody}</p>
        <p>{geoLaunchNote}</p>
      </article>
    </main>
  );
}