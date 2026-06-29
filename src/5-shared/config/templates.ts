/**
 * Template registry — TypeScript source of truth per ADR 0001.
 *
 * Each template is a bundle of:
 *  - meta:     identity, screenshot path, accent color (picker UI)
 *  - gating:   premium flag (server-enforced)
 *  - defaults: palette + font defaults seeded on first pick (tenant can override)
 *  - tokens:   design tokens applied as inline custom properties on the
 *              tenant layout wrapper at render time
 *  - variants: per-block named layout choices the dispatcher reads
 *  - containerClass / themeClass: wrapper/inner Tailwind utility classes
 */

export type TenantTemplateId =
  | "default"
  | "modern"
  | "classic"
  | "monoline"
  | "canyon"
  | "atelier"
  | "harbor"
  | "garden"
  | "journal"
  | "loft"
  | "kiln";

export type HeroVariantId =
  | "centered-overlay"
  | "split-image-right"
  | "classic-overlay"
  | "minimal-text";

export type HeaderVariantId =
  | "sticky-minimal"
  | "centered-serif"
  | "sticky-blur"
  | "floating-pill";

export interface TemplateDefinition {
  meta: {
    id: TenantTemplateId;
    screenshotPath: string;
    accentColor: string;
  };
  gating: {
    isPremium: boolean;
  };
  defaults: {
    palette: "ocean" | "sunset" | "forest";
    fontHeading: string;
    fontBody: string;
  };
  tokens: {
    radius: string;
    sectionGap: string;
    tracking: string;
    fontHeadingFamily: string;
  };
  variants: {
    hero: HeroVariantId;
    header: HeaderVariantId;
  };
  themeClass: string;
  containerClass: string;
}

export const TEMPLATES: Record<TenantTemplateId, TemplateDefinition> = {
  default: {
    meta: {
      id: "default",
      screenshotPath: "/templates/default.svg",
      accentColor: "oklch(0.55 0.18 250)",
    },
    gating: { isPremium: false },
    defaults: {
      palette: "ocean",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "0.75rem",
      sectionGap: "3rem",
      tracking: "0em",
      fontHeadingFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    variants: {
      hero: "centered-overlay",
      header: "sticky-minimal",
    },
    themeClass: "font-sans",
    containerClass: "",
  },
  modern: {
    meta: {
      id: "modern",
      screenshotPath: "/templates/modern.svg",
      accentColor: "oklch(0.55 0.2 25)",
    },
    gating: { isPremium: false },
    defaults: {
      palette: "sunset",
      fontHeading: "var(--font-geist-mono)",
      fontBody: "var(--font-geist-mono)",
    },
    tokens: {
      radius: "0rem",
      sectionGap: "0rem",
      tracking: "-0.05em",
      fontHeadingFamily:
        '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
    },
    variants: {
      hero: "split-image-right",
      header: "sticky-blur",
    },
    themeClass: "font-mono tracking-tighter",
    containerClass: "max-w-full px-0",
  },
  classic: {
    meta: {
      id: "classic",
      screenshotPath: "/templates/classic.svg",
      accentColor: "oklch(0.45 0.15 145)",
    },
    gating: { isPremium: false },
    defaults: {
      palette: "forest",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "2.5rem",
      sectionGap: "5rem",
      tracking: "0.04em",
      fontHeadingFamily: '"Georgia", ui-serif, serif',
    },
    variants: {
      hero: "classic-overlay",
      header: "centered-serif",
    },
    themeClass: "font-serif",
    containerClass: "max-w-5xl mx-auto px-2",
  },

  // ── New free templates ─────────────────────────────────────────────────
  monoline: {
    meta: {
      id: "monoline",
      screenshotPath: "/templates/monoline.svg",
      accentColor: "oklch(0.55 0.18 250)",
    },
    gating: { isPremium: false },
    defaults: {
      palette: "ocean",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "0.25rem",
      sectionGap: "4rem",
      tracking: "0em",
      fontHeadingFamily:
        '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    variants: {
      hero: "minimal-text",
      header: "sticky-minimal",
    },
    themeClass: "font-sans",
    containerClass: "max-w-4xl mx-auto px-4",
  },
  canyon: {
    meta: {
      id: "canyon",
      screenshotPath: "/templates/canyon.svg",
      accentColor: "oklch(0.55 0.15 80)",
    },
    gating: { isPremium: false },
    defaults: {
      palette: "forest",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "1rem",
      sectionGap: "4rem",
      tracking: "0em",
      fontHeadingFamily:
        '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    variants: {
      hero: "split-image-right",
      header: "sticky-minimal",
    },
    themeClass: "font-sans",
    containerClass: "",
  },

  // ── New premium templates ──────────────────────────────────────────────
  atelier: {
    meta: {
      id: "atelier",
      screenshotPath: "/templates/atelier.svg",
      accentColor: "oklch(0.4 0.12 30)",
    },
    gating: { isPremium: true },
    defaults: {
      palette: "sunset",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "0rem",
      sectionGap: "7rem",
      tracking: "0.05em",
      fontHeadingFamily: '"Georgia", ui-serif, serif',
    },
    variants: {
      hero: "classic-overlay",
      header: "centered-serif",
    },
    themeClass: "font-serif",
    containerClass: "max-w-6xl mx-auto px-6",
  },
  harbor: {
    meta: {
      id: "harbor",
      screenshotPath: "/templates/harbor.svg",
      accentColor: "oklch(0.5 0.15 230)",
    },
    gating: { isPremium: true },
    defaults: {
      palette: "ocean",
      fontHeading: "var(--font-geist-mono)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "0rem",
      sectionGap: "2rem",
      tracking: "-0.02em",
      fontHeadingFamily:
        '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
    },
    variants: {
      hero: "minimal-text",
      header: "sticky-blur",
    },
    themeClass: "font-mono",
    containerClass: "max-w-5xl mx-auto px-4",
  },
  garden: {
    meta: {
      id: "garden",
      screenshotPath: "/templates/garden.svg",
      accentColor: "oklch(0.55 0.12 145)",
    },
    gating: { isPremium: true },
    defaults: {
      palette: "forest",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "3.5rem",
      sectionGap: "6rem",
      tracking: "0em",
      fontHeadingFamily: '"Georgia", ui-serif, serif',
    },
    variants: {
      hero: "centered-overlay",
      header: "floating-pill",
    },
    themeClass: "font-serif",
    containerClass: "max-w-5xl mx-auto px-4",
  },
  journal: {
    meta: {
      id: "journal",
      screenshotPath: "/templates/journal.svg",
      accentColor: "oklch(0.45 0.18 25)",
    },
    gating: { isPremium: true },
    defaults: {
      palette: "sunset",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "0.5rem",
      sectionGap: "5rem",
      tracking: "0.02em",
      fontHeadingFamily: '"Georgia", ui-serif, serif',
    },
    variants: {
      hero: "minimal-text",
      header: "centered-serif",
    },
    themeClass: "font-serif",
    containerClass: "max-w-3xl mx-auto px-4",
  },
  loft: {
    meta: {
      id: "loft",
      screenshotPath: "/templates/loft.svg",
      accentColor: "oklch(0.3 0.04 250)",
    },
    gating: { isPremium: true },
    defaults: {
      palette: "ocean",
      fontHeading: "var(--font-sans)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "0rem",
      sectionGap: "2rem",
      tracking: "0em",
      fontHeadingFamily:
        '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    variants: {
      hero: "split-image-right",
      header: "floating-pill",
    },
    themeClass: "font-sans",
    containerClass: "max-w-full px-0",
  },
  kiln: {
    meta: {
      id: "kiln",
      screenshotPath: "/templates/kiln.svg",
      accentColor: "oklch(0.55 0.15 50)",
    },
    gating: { isPremium: true },
    defaults: {
      palette: "sunset",
      fontHeading: "var(--font-geist-mono)",
      fontBody: "var(--font-sans)",
    },
    tokens: {
      radius: "1.25rem",
      sectionGap: "4rem",
      tracking: "-0.01em",
      fontHeadingFamily:
        '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
    },
    variants: {
      hero: "classic-overlay",
      header: "sticky-blur",
    },
    themeClass: "font-mono",
    containerClass: "max-w-5xl mx-auto px-4",
  },
} as const;

/**
 * Resolve any string (potentially a retired slug or null) to a valid template id.
 * Unknown slugs degrade to "default" rather than crashing the render.
 */
export function resolveTemplateId(
  id: string | null | undefined,
): TenantTemplateId {
  if (id && id in TEMPLATES) return id as TenantTemplateId;
  return "default";
}

/**
 * Resolve a template id to its full definition, with stale-slug fallback baked in.
 */
export function getTemplate(id: string | null | undefined): TemplateDefinition {
  return TEMPLATES[resolveTemplateId(id)];
}
