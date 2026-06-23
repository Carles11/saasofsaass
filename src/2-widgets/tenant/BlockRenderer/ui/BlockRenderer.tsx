import type { Block, Tenant } from "@/5-shared/lib/db/schema";
import { SupportedLocaleType } from "@/5-shared/types/languages/supportedLocales";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
import type { ComponentType } from "react";
import { blockRegistry } from "../config/registry";
import type { BlockProps } from "../config/types";
import { resolveBlockT } from "../config/utils/block";

interface BlockRendererProps {
  blocks: Block[];
  locale: SupportedLocaleType;
  tenant: Tenant;
}

/**
 * WIDGET: BlockRenderer
 * The core engine that resolves DB blocks into Bentley UI components.
 */
export function BlockRenderer({ blocks, locale, tenant }: BlockRendererProps) {
  // 1. Filter out hidden blocks
  const visibleBlocks = blocks.filter((b) => b.isVisible);

  // 2. Handle empty state
  if (visibleBlocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] border-2 border-dashed border-border rounded-[3rem] m-6">
        <p className="text-muted-foreground text-sm font-medium italic">
          "The workshop is ready. No blocks have been deployed yet."
        </p>
      </div>
    );
  }

  // 3. Sort footer blocks to the end
  const sortedBlocks = [
    ...visibleBlocks.filter((b) => b.type !== "footer"),
    ...visibleBlocks.filter((b) => b.type === "footer"),
  ];

  return (
    <div className="flex flex-col w-full">
      {sortedBlocks.map((block) => (
        <RegistryBlock
          key={block.id}
          block={block}
          locale={locale}
          tenant={tenant}
          templateId={tenant.templateId as import("@/5-shared/config/templates").TenantTemplateId}
        />
      ))}
    </div>
  );
}

/**
 * INTERNAL: RegistryBlock
 * Resolves an individual block from the registry and handles translation fallback.
 */
function RegistryBlock({
  block,
  locale,
  tenant,
  templateId,
}: {
  block: Block;
  locale: SupportedLocaleType;
  tenant: Tenant;
  templateId: import("@/5-shared/config/templates").TenantTemplateId;
}) {
  const entry = blockRegistry[block.type as BlockKind];

  // 1. Handle missing implementation in registry — silently skip
  if (!entry) return null;

  // 2. Merge default config with tenant-specific overrides
  const config = {
    ...entry.defaultConfig,
    ...(block.config as Record<string, unknown>),
  };

  // 3. Resolve translations (Primary Locale -> Tenant Default -> Registry Default)
  const t = resolveBlockT(
    block.translations as Record<string, any>,
    locale,
    tenant.defaultLocale as SupportedLocaleType
  );

  const Component = entry.component as ComponentType<BlockProps>;

  return (
    <>
      <Component
        block={block}
        blockId={block.id}
        config={config}
        t={t}
        locale={locale}
        tenant={tenant}
        templateId={templateId}
      />
    </>
  );
}
