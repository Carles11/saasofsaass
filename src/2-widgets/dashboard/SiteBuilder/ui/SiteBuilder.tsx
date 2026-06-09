"use client";

import TenantLayoutResolver from "@/2-widgets/tenant/ui/TenantLayoutResolver";
import { updateTenantLocales } from "@/3-features/manage-site-blocks/actions/blockActions";
import { TemplatePicker } from "@/3-features/manage-site-blocks/ui/TemplatePicker";
import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import type { Block, Tenant, TenantEntity, TenantTranslation } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AutoTranslateButton } from "./AutoTranslateButton";
import { BlockEditSheet } from "./BlockEditSheet";
import { BlockList } from "./BlockList";
import { CollectionManager } from "./CollectionManager";
import { GalleryManager } from "./GalleryManager";
import { LanguageSelector } from "./LanguageSelector";

type EntityRow = { entity: TenantEntity; translation: TenantTranslation | null };
type UserRole = "owner" | "editor" | null;

interface SiteBuilderProps {
  tenant: Tenant;
  blocks: Block[];
  initialEntities: EntityRow[];
  userRole?: UserRole;
}

export function SiteBuilder({ tenant, blocks, initialEntities, userRole }: SiteBuilderProps) {
  const [activeLocale, setActiveLocale] = useState<SupportedLocaleType>(
    tenant.defaultLocale as SupportedLocaleType
  );
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [locales, setLocales] = useState<string[]>(tenant.locales);
  const [isSaving, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("blocks");
  // Live preview state (fix type)
  const [previewTemplateId, setPreviewTemplateId] = useState<
    import("@/5-shared/config/templates").TenantTemplateId
  >(tenant.templateId as import("@/5-shared/config/templates").TenantTemplateId);

  // Restore selectedBlock for BlockEditSheet
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">{tenant.name}</h2>
          <p className="text-sm text-zinc-500">Site Builder</p>
        </div>
        <div className="flex items-center gap-2">
          <AutoTranslateButton tenantId={tenant.id} />
          <LanguageSelector
            locales={tenant.locales}
            activeLocale={activeLocale}
            onChange={(locale) => {
              setActiveLocale(locale);
              // Replace the locale in the URL and navigate
              // Path: /[locale]/(dashboard)/dashboard/site-builder/[tenantId]
              // params: { locale, tenantId }
              const segments = pathname.split("/");
              if (segments[1] && tenant.locales.includes(locale)) {
                segments[1] = locale;
                router.push(segments.join("/"));
              }
            }}
          />
        </div>
      </div>

      {/* ── Main tabs ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          {userRole === "owner" && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="blocks" className="mt-4">
          {/* Only the block preview area uses the tenant template styles */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <TenantLayoutResolver templateId={previewTemplateId}>
              <BlockList
                blocks={blocks}
                tenantId={tenant.id}
                onEdit={setSelectedBlockId}
                setActiveTab={setActiveTab}
                userRole={userRole}
              />
            </TenantLayoutResolver>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          {/* Context-sensitive content manager */}
          {selectedBlockId ? (
            (() => {
              const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
              if (!selectedBlock) {
                return <div className="text-zinc-400 text-center py-8">Block not found.</div>;
              }
              if (selectedBlock.type === "image-gallery") {
                return (
                  <GalleryManager
                    blockId={selectedBlockId}
                    tenant={tenant}
                    activeLocale={activeLocale}
                    onImagesChange={() => {}}
                  />
                );
              }
              if (["blog-feed", "podcast-feed", "awards"].includes(selectedBlock.type)) {
                return (
                  <CollectionManager
                    tenant={tenant}
                    activeLocale={activeLocale}
                    initialEntities={initialEntities}
                    blockType={selectedBlock.type}
                    blockId={selectedBlock.id}
                  />
                );
              }
              return (
                <div className="text-zinc-400 text-center py-8">
                  This block has no content to manage.
                </div>
              );
            })()
          ) : (
            <div className="text-zinc-400 text-center py-8">
              Select a block to manage its content.
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Enabled Languages</h3>
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
            <p className="text-xs text-zinc-500 mt-2">
              Click to enable/disable languages for your public site.
              {isSaving && <span className="ml-2 text-blue-500">Saving…</span>}
            </p>
          </div>
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Site Template</h3>
            <TemplatePicker
              previewTemplateId={previewTemplateId}
              setPreviewTemplateId={setPreviewTemplateId}
            />
          </div>
          {/* Future: dark mode, subdomain, custom domain, etc. */}
        </TabsContent>
      </Tabs>

      {/* ── Block edit side sheet ────────────────────────────────────── */}
      <BlockEditSheet
        block={selectedBlock}
        tenant={tenant}
        activeLocale={activeLocale}
        open={selectedBlockId !== null}
        onClose={() => setSelectedBlockId(null)}
      />
    </div>
  );
}
