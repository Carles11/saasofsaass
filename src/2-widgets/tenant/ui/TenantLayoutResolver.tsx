import { getTemplate, resolveTemplateId, TEMPLATE_META, TenantTemplateId } from "@/5-shared/config/templates";
import React from "react";

interface TenantLayoutResolverProps {
  templateId: TenantTemplateId | string;
  children: React.ReactNode;
  /** CSS var reference for heading font, e.g. "var(--font-playfair-display)" */
  titleFont?: string;
  /** CSS var reference for body font, e.g. "var(--font-sans)" */
  bodyFont?: string;
}

/**
 * Bentley Hybrid Layout Resolver.
 *
 * Applies the template's design tokens as inline CSS custom properties on the
 * wrapper, so descendants inherit --radius / --section-gap / --tracking /
 * --font-heading without needing per-template CSS rules in globals.css.
 *
 * Per-tenant titleFont/bodyFont overrides win over the template's defaults
 * (inline style beats class rules in CSS specificity).
 */
export default function TenantLayoutResolver({
  templateId,
  children,
  titleFont,
  bodyFont,
}: TenantLayoutResolverProps) {
  const template = getTemplate(templateId);
  const bgClass = TEMPLATE_META[resolveTemplateId(templateId)].bgClass ?? "";

  const inlineStyle: Record<string, string> = {
    "--radius": template.tokens.radius,
    "--section-gap": template.tokens.sectionGap,
    "--tracking": template.tokens.tracking,
    "--font-heading": template.tokens.fontHeadingFamily,
    fontFamily: "var(--font-heading)",
  };

  if (titleFont) inlineStyle["--font-heading"] = titleFont;
  if (bodyFont) {
    inlineStyle["--font-body"] = bodyFont;
    // Override the template's font-family so inherited body text uses the chosen font
    inlineStyle.fontFamily = bodyFont;
  }

  return (
    <div className={`${template.themeClass} ${bgClass}`} style={inlineStyle as React.CSSProperties}>
      <main className={template.containerClass + " bentley-container"}>{children}</main>
    </div>
  );
}
