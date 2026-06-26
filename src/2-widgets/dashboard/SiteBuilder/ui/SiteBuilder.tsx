"use client";

import TenantLayoutResolver from "@/2-widgets/tenant/ui/TenantLayoutResolver";
import { updateTenantLocales } from "@/3-features/manage-site-blocks/actions/blockActions";
import { generatePreviewToken } from "@/3-features/manage-site-blocks/actions/generatePreviewToken";
import { TemplatePicker } from "@/3-features/manage-site-blocks/ui/TemplatePicker";
import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import type { Block, Tenant, TenantDomain, TenantEntity, TenantTranslation } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useState, useTransition } from "react";
import { BlockList } from "./BlockList";
import { SharePreviewButton } from "./SharePreviewButton";
import { CustomDomainSection } from "./CustomDomainSection";
import { SubdomainSection } from "./SubdomainSection";
import { TypographySection } from "./TypographySection";
import { PaletteSection } from "./PaletteSection";
import { LogoSection } from "./LogoSection";
import { SeoSection } from "./SeoSection";

type EntityRow = { entity: TenantEntity; translation: TenantTranslation | null };
type UserRole = "owner" | "editor" | null;

interface SiteBuilderProps {
  tenant: Tenant;
  blocks: Block[];
  initialEntities: EntityRow[];
  userRole?: UserRole;
  translations?: Record<string, string>;
  domainRows: TenantDomain[];
  plan: string;
  initialTitleFont?: string;
  initialBodyFont?: string;
  initialPalette?: string;
  initialSeoEnabled?: boolean;
  initialLogoUrl?: string | null;
  initialLogoS3Key?: string | null;
  initialLogoLinkUrl?: string | null;
}

export function SiteBuilder({
  tenant,
  blocks,
  initialEntities,
  userRole,
  translations,
  domainRows,
  plan,
  initialTitleFont,
  initialBodyFont,
  initialPalette,
  initialSeoEnabled,
  initialLogoUrl,
  initialLogoS3Key,
  initialLogoLinkUrl,
}: SiteBuilderProps) {
  const [activeLocale, setActiveLocale] = useState<SupportedLocaleType>(
    tenant.defaultLocale as SupportedLocaleType
  );
  const [locales, setLocales] = useState<string[]>(tenant.locales);
  const [currentSlug, setCurrentSlug] = useState(tenant.slug);
  const [isSaving, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("blocks");
  const [settingsTab, setSettingsTab] = useState<string>("appearance");
  const [previewTemplateId, setPreviewTemplateId] = useState<
    import("@/5-shared/config/templates").TenantTemplateId
  >(tenant.templateId as import("@/5-shared/config/templates").TenantTemplateId);

  // Preview token state
  const [isPreviewing, startPreviewTransition] = useTransition();

  const handleLocaleChange = useCallback(
    (locale: SupportedLocaleType) => {
      setActiveLocale(locale);
    },
    [],
  );

  const devPort = process.env.NEXT_PUBLIC_DEV_PORT || "3000";
  const prodRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com")
    .replace(/https?:\/\//, "")
    .replace(/\/+$/, "");
  const isDev = process.env.NODE_ENV === "development";

  function handlePreview() {
    startPreviewTransition(async () => {
      const url = await generatePreviewToken(tenant.id);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

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
  const tabAppearance = resolveTranslation(translations, "settings.tab.appearance", "Appearance");
  const tabDomain = resolveTranslation(translations, "settings.tab.domain", "Domain");
  const tabSite = resolveTranslation(translations, "settings.tab.site", "Site");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{tenant.name}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            disabled={isPreviewing}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors disabled:opacity-50"
          >
            {isPreviewing
              ? resolveTranslation(translations, "settings.preview.opening", "Opening…")
              : resolveTranslation(translations, "preview", "Preview")}
          </button>
          <SharePreviewButton
            tenantId={tenant.id}
            plan={plan}
            locale={activeLocale}
            isOwner={userRole === "owner"}
            translations={translations}
          />
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
                plan={plan}
              />
            </TenantLayoutResolver>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Tabs value={settingsTab} onValueChange={setSettingsTab} defaultValue="appearance">
            <TabsList variant="outline" className="mb-6">
              <TabsTrigger value="appearance">{tabAppearance}</TabsTrigger>
              <TabsTrigger value="domain">{tabDomain}</TabsTrigger>
              <TabsTrigger value="site">{tabSite}</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <div className="mb-8">
                <h3 className="font-semibold mb-2">{siteTemplate}</h3>
                <TemplatePicker
                  previewTemplateId={previewTemplateId}
                  setPreviewTemplateId={setPreviewTemplateId}
                />
              </div>
              <TypographySection
                tenantId={tenant.id}
                tenantName={tenant.name}
                initialTitleFont={initialTitleFont ?? "playfair"}
                initialBodyFont={initialBodyFont ?? "inter"}
                translations={translations}
              />
              <PaletteSection
                tenantId={tenant.id}
                initialPalette={initialPalette ?? "ocean"}
                translations={translations}
              />
            </TabsContent>

            <TabsContent value="domain">
              <SubdomainSection
                tenantId={tenant.id}
                initialSlug={tenant.slug}
                translations={translations}
                onSlugChange={setCurrentSlug}
                isDev={isDev}
                devPort={devPort}
                prodRoot={prodRoot}
                activeLocale={activeLocale}
              />
              <CustomDomainSection
                tenantId={tenant.id}
                initialDomainRows={domainRows}
                plan={plan}
                translations={translations}
              />
            </TabsContent>

            <TabsContent value="site">
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
              <LogoSection
                tenantId={tenant.id}
                slug={currentSlug}
                initialLogoUrl={initialLogoUrl}
                initialLogoS3Key={initialLogoS3Key}
                initialLogoLinkUrl={initialLogoLinkUrl}
              />
              <SeoSection
                tenantId={tenant.id}
                initialSeoEnabled={initialSeoEnabled ?? true}
                plan={plan}
                translations={translations}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
