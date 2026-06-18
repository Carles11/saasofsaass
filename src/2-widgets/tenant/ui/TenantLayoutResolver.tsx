import { TEMPLATES, TenantTemplateId } from "@/5-shared/config/templates";
import React from "react";

interface TenantLayoutResolverProps {
  templateId: TenantTemplateId;
  children: React.ReactNode;
  /** CSS var reference for heading font, e.g. "var(--font-playfair-display)" */
  titleFont?: string;
  /** CSS var reference for body font, e.g. "var(--font-sans)" */
  bodyFont?: string;
}

/**
 * Bentley Hybrid Layout Resolver
 * Applies the correct theme and container classes for the selected template.
 * Accepts optional titleFont/bodyFont to override the template's default --font-heading
 * and font-family via inline styles (which win over class rules).
 */
export default function TenantLayoutResolver({
  templateId,
  children,
  titleFont,
  bodyFont,
}: TenantLayoutResolverProps) {
  const template = TEMPLATES[templateId] || TEMPLATES.default;
  const inlineStyle: Record<string, string> = {};
  if (titleFont) inlineStyle["--font-heading"] = titleFont;
  if (bodyFont) {
    inlineStyle["--font-body"] = bodyFont;
    // Override the template's Tailwind font utility so inherited body text uses the chosen font
    inlineStyle["fontFamily"] = bodyFont;
  }
  return (
    <div className={template.themeClass} style={inlineStyle as React.CSSProperties}>
      <main className={template.containerClass + " bentley-container"}>{children}</main>
    </div>
  );
}
