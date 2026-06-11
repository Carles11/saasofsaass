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
          SaaSofSaaSs is a modern, high-performance multi-tenant infrastructure engine designed to build, manage, and scale Software-as-a-Service platforms. It provides native edge routing, dynamic tenant resolution via subdomains, and custom domain mapping out of the box.
        </p>
        <h3>Core Infrastructure Capabilities</h3>
        <ul>
          <li>Domain-driven tenant isolation and middleware proxy routing.</li>
          <li>Global internationalization with native support for 11 languages including English, Spanish, Chinese, Hindi, and Arabic.</li>
          <li>Transactional monetization and comprehensive tenant management dashboards.</li>
        </ul>
        <p>Official release scheduled for late 2026.</p>
      </article>
    </main>
  );
}