"use client";

import TenantLayoutResolver from "@/2-widgets/tenant/ui/TenantLayoutResolver";
import { updateTenantLocales } from "@/3-features/manage-site-blocks/actions/blockActions";
import { TemplatePicker } from "@/3-features/manage-site-blocks/ui/TemplatePicker";
import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import type { Block, Tenant, TenantEntity, TenantTranslation } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useState, useTransition } from "react";
import { BlockList } from "./BlockList";

type EntityRow = { entity: TenantEntity; translation: TenantTranslation | null };
type UserRole = "owner" | "editor" | null;

interface SiteBuilderProps {
  tenant: Tenant;
  blocks: Block[];
  initialEntities: EntityRow[];
  userRole?: UserRole;
  translations?: Record<string, string>;
}

export function SiteBuilder({
  tenant,
  blocks,
  initialEntities,
  userRole,
  translations,
}: SiteBuilderProps) {
  const [activeLocale, setActiveLocale] = useState<SupportedLocaleType>(
    tenant.defaultLocale as SupportedLocaleType
  );
  const [locales, setLocales] = useState<string[]>(tenant.locales);
  const [isSaving, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("blocks");
  const [previewTemplateId, setPreviewTemplateId] = useState<
    import("@/5-shared/config/templates").TenantTemplateId
  >(tenant.templateId as import("@/5-shared/config/templates").TenantTemplateId);

  const handleLocaleChange = useCallback(
    (locale: SupportedLocaleType) => {
      setActiveLocale(locale);
    },
    [],
  );

const devPort =
  process.env.NEXT_PUBLIC_DEV_PORT || "3000";

const prodRoot = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
)
  .replace(/https?:\/\//, "")
  .replace(/\/+$/, "");

const isDev = process.env.NODE_ENV === "development";

const previewUrl = isDev
  ? `http://${tenant.slug}.localhost:${devPort}/${activeLocale}`
  : `https://${tenant.slug}.${prodRoot}/${activeLocale}`;

  const subtitle = resolveTranslation(translations, "subtitle", "Site Builder");
  const tabBlocks = resolveTranslation(translations, "tab.blocks", "Blocks");
  const tabSettings = resolveTranslation(translations, "tab.settings", "Settings");
  const enabledLanguages = resolveTranslation(
    translations,
    "settings.languages",
    "Enabled Languages",
  );
  const languagesHint = resolveTranslation(
    translations,
    "settings.languages-hint",
    "Click to enable/disable languages for your public site.",
  );
  const savingLabel = resolveTranslation(translations, "settings.saving", "Saving...");
  const siteTemplate = resolveTranslation(translations, "settings.template", "Site Template");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{tenant.name}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            {translations?.preview ?? "Preview"}
          </a>
        </div>
      </div>

      {/* ── Main tabs ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">{tabBlocks}</TabsTrigger>
          {userRole === "owner" && <TabsTrigger value="settings">{tabSettings}</TabsTrigger>}
        </TabsList>

        <TabsContent value="blocks" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <TenantLayoutResolver templateId={previewTemplateId}>
              <BlockList
                blocks={blocks}
                tenantId={tenant.id}
                tenant={tenant}
                activeLocale={activeLocale}
                initialEntities={initialEntities}
                userRole={userRole}
                translations={translations}
                onLocaleChange={handleLocaleChange}
              />
            </TenantLayoutResolver>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">{enabledLanguages}</h3>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LOCALES.map((locale) => (
                <Badge
                  key={locale}
                  variant={locales.includes(locale) ? "default" : "outline"}
                  className={
                    "cursor-pointer select-none" +
                    (isSaving ? " opacity-60 pointer-events-none" : "")
                  }
                  onClick={() => {
                    const next = locales.includes(locale)
                      ? locales.filter((x) => x !== locale)
                      : [...locales, locale];
                    setLocales(next);
                    startTransition(() => {
                      updateTenantLocales(tenant.id, next);
                    });
                  }}
                >
                  {locale}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {languagesHint}
              {isSaving && <span className="ml-2 text-blue-500">{savingLabel}</span>}
            </p>
          </div>
          <div className="mb-8">
            <h3 className="font-semibold mb-2">{siteTemplate}</h3>
            <TemplatePicker
              previewTemplateId={previewTemplateId}
              setPreviewTemplateId={setPreviewTemplateId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
