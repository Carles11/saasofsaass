import type { Block, Tenant } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import type { BlockKind, GalleryImage } from "@/5-shared/types/tenants/blocks";
import type { ReactNode } from "react";

// ── Shared props contract every block component must satisfy ───────────────────
// `config` and `t` are Record<string, unknown> / Record<string, string> at this
// level. Each block narrows them internally via its own typed interface.
export interface BlockProps {
  block: Block;
  blockId: string;
  config: {
    images?: GalleryImage[];
    lang?: string;
    [key: string]: unknown;
  };
  t: Record<string, string>;
  locale: SupportedLocaleType;
  tenant: Tenant;
  templateId: import("@/5-shared/config/templates").TenantTemplateId;
}

// Both sync Server Components and async RSCs are valid block components.
export type BlockComponent =
  | ((props: BlockProps) => ReactNode)
  | ((props: BlockProps) => Promise<ReactNode>);

export interface BlockRegistryEntry {
  component: BlockComponent;
  defaultConfig: Record<string, unknown>;
  /** Whether this block kind should generate an auto-nav link in the unified header.
   * When true, a link is generated if the block instance has a non-empty heading
   * translation. Set false for blocks that aren't navigable destinations
   * (e.g. hero, cta-banner). */
  includeInNav: boolean;
  /** Generic nav label for auto-generated header links (e.g. "Blog", "Contact").
   * When absent, falls back to the block's translated heading/title (for text-content). */
  navLabel?: string;
  /** When set, the nav link for this block type points to this path
   * (e.g. "/blog" for blog-feed) instead of an #anchor on the homepage. */
  archivePath?: string;
  /** Translatable fields rendered by the FocusedLanguageEditor in the dashboard.
   * Collection blocks (e.g. blog-feed) leave this empty — their content
   * lives in tenant_entities and is managed via CollectionManager. */
  fields?: Array<{ key: string; label: string; inputType: "input" | "textarea" | "image" | "richtext" }>;
}

export type BlockRegistry = Partial<Record<BlockKind, BlockRegistryEntry>>;
