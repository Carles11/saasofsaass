import { TEMPLATES, TenantTemplateId } from "@/5-shared/config/templates";
import React from "react";

interface TenantLayoutResolverProps {
  templateId: TenantTemplateId;
  children: React.ReactNode;
}

/**
 * Bentley Hybrid Layout Resolver
 * Applies the correct theme and container classes for the selected template.
 */
export default function TenantLayoutResolver({ templateId, children }: TenantLayoutResolverProps) {
  const template = TEMPLATES[templateId] || TEMPLATES.default;
  return (
    <div className={template.themeClass}>
      <main className={template.containerClass + " bentley-container"}>{children}</main>
    </div>
  );
}
