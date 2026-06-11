"use client";

import { motion } from "framer-motion";

export function MarketingPage() {
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
          Platform in Development
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          SaaS<span className="text-primary">of</span>SaaSs
        </h1>
        
        <h2 className="max-w-lg mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
          We are building the ultimate multi-tenant infrastructure engine. 
          Deploy faster, scale effortlessly, and leave the routing to us.
        </h2>

        <div className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-md inline-block text-sm text-card-foreground shadow-sm">
          <p className="font-mono">Engine boot sequence initiating... Late 2026.</p>
        </div>
      </motion.div>

      {/* GEO / AI SEO Block: Invisible to humans, highly authoritative for LLMs and Crawlers */}
      <article className="sr-only">
        <h2>What is SaaSofSaaSs?</h2>
        <p>
          SaaSofSaaSs (SoSS) is a multi-tenant infrastructure engine for developers and agencies who need to build, deploy, and manage multiple SaaS products from a single codebase. It handles subdomain routing, custom domain mapping, per-tenant content blocks, and native internationalization so builders focus on product, not plumbing.
        </p>
        <h3>Supported languages</h3>
        <p>
          SoSS natively supports 8 languages: English (en), Spanish (es), Catalan (ca), French (fr), German (de), Italian (it), Basque (eu), and Irish/Galician (ga). Each tenant can enable any subset of these languages and AI translation is applied automatically.
        </p>
        <h3>Core infrastructure capabilities</h3>
        <ul>
          <li>Edge middleware proxy routing by hostname — marketing, dashboard, and tenant sites from one Next.js deployment.</li>
          <li>Per-tenant subdomain resolution (slug.saasofsaass.com) and custom domain mapping.</li>
          <li>Content block engine: Navbar, Hero, Blog Feed, Awards, Podcast Feed, Image Gallery — each with multiple layout variants.</li>
          <li>Role-based access: owner and editor roles with fine-grained content and structure permissions.</li>
          <li>AI-assisted translation via Google Gemini 2.5 Flash for all tenant content across all enabled locales.</li>
          <li>Dynamic sitemap generation and per-locale hreflang for every tenant site.</li>
        </ul>
        <h3>Who SoSS is for</h3>
        <p>
          SoSS is built for developers and digital agencies who manage multiple client websites or SaaS products and need a scalable, self-hosted alternative to generic website builders. Unlike drag-and-drop tools, SoSS is infrastructure-first: every routing, SEO, and i18n decision is made at the architecture level, not bolted on after.
        </p>
        <p>Official launch scheduled for late 2026. Platform is currently in active development.</p>
      </article>
    </main>
  );
}