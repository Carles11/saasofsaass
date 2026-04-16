// Bentley Hybrid Template Registry
export type TenantTemplateId = "default" | "modern" | "classic";

export const TEMPLATES: Record<
  TenantTemplateId,
  {
    id: TenantTemplateId;
    themeClass: string;
    containerClass: string;
  }
> = {
  default: {
    id: "default",
    themeClass: "theme-bentley-default font-sans",
    containerClass: "max-w-7xl mx-auto px-6",
  },
  modern: {
    id: "modern",
    themeClass: "theme-bentley-modern font-mono tracking-tighter",
    containerClass: "max-w-full px-0",
  },
  classic: {
    id: "classic",
    themeClass: "theme-bentley-classic font-serif",
    containerClass: "max-w-5xl mx-auto px-12",
  },
};
