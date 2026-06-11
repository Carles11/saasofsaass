export type TenantTemplateId = "default" | "modern" | "classic";

export const TEMPLATES: Record<
  TenantTemplateId,
  { themeClass: string; containerClass: string }
> = {
  default: {
    themeClass: "theme-bentley-default font-sans",
    containerClass: "",
  },
  modern: {
    themeClass: "theme-bentley-modern font-mono tracking-tighter",
    containerClass: "max-w-full px-0",
  },
  classic: {
    themeClass: "theme-bentley-classic font-serif",
    containerClass: "max-w-5xl mx-auto px-12",
  },
} as const;
