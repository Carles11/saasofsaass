"use client";

import { useStore } from "@/5-shared/store/index";

/**
 * WIDGET: Tenant Header
 * Demonstrates consuming the Entity (Tenant) slice.
 * Uses explicit index import to ensure resolution across all build environments.
 */
export const TenantHeader = () => {
  // Accessing the hydrated tenant data
  const tenant = useStore((state) => state.activeTenant);
  if (!tenant) return null;

  // Bentley Standard: Using DB-driven branding from the store
  const branding = (tenant.branding as { logoUrl?: string; primaryColor?: string }) || {};
  const templateId = tenant.templateId || "default";
  console.log("Tenant branding and templateId:", tenant, branding, templateId);
  // Polymorphic layout logic
  if (templateId === "classic") {
    // Classic: Center logo, nav below
    return (
      <header
        className="w-full bg-background border-b border-border py-6 px-4 flex flex-col items-center"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <div className="flex flex-col items-center">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={tenant.name}
              className="h-10 w-auto object-contain mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-black text-2xl tracking-tighter uppercase text-foreground mb-2">
              {tenant.name}
            </span>
          )}
          {/* Navigation below logo (placeholder) */}
          <nav className="mt-2 flex gap-6">
            <a className="text-muted-foreground hover:text-primary transition" href="#">
              Home
            </a>
            <a className="text-muted-foreground hover:text-primary transition" href="#">
              About
            </a>
            <a className="text-muted-foreground hover:text-primary transition" href="#">
              Contact
            </a>
          </nav>
        </div>
      </header>
    );
  }

  if (templateId === "modern") {
    // Modern: Sticky, slim, glassmorphism bar with sharp corners
    return (
      <header
        className="h-16 flex items-center justify-between px-8 bg-background/70 backdrop-blur-md border-b border-border sticky top-0 z-50 rounded-none shadow-sm"
        style={{ fontFamily: "var(--font-heading)", borderRadius: "0px" }}
      >
        <div className="flex items-center gap-4">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={tenant.name}
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-black text-xl tracking-tighter uppercase text-foreground">
              {tenant.name}
            </span>
          )}
        </div>
        <nav className="flex gap-6">
          <a className="text-muted-foreground hover:text-primary transition" href="#">
            Home
          </a>
          <a className="text-muted-foreground hover:text-primary transition" href="#">
            About
          </a>
          <a className="text-muted-foreground hover:text-primary transition" href="#">
            Contact
          </a>
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            Live Site
          </span>
        </div>
      </header>
    );
  }

  // Default: Original layout
  return (
      <header
        className="h-20 flex items-center justify-between px-8 bg-background border-b border-border sticky top-0 z-50"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <div className="flex items-center gap-4">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={tenant.name}
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-black text-xl tracking-tighter uppercase text-foreground">
              {tenant.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              Live Site
            </span>
          </div>
          <div className="h-8 w-[1px] bg-border" />
          <div className="text-[10px] font-mono text-muted-foreground">
            Engine: <span className="text-foreground font-bold uppercase">Turbo v16.2</span>
          </div>
        </div>
      </header>
  );
};
