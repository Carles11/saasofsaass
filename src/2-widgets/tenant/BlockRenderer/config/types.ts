import type { Block, Tenant } from '@/5-shared/lib/db/schema'
import type { SupportedLocaleType } from '@/5-shared/types'
import type { ReactNode } from 'react'
import type { BlockKind } from '@/5-shared/types/tenants/blocks'

// ── Shared props contract every block component must satisfy ───────────────────
// `config` and `t` are Record<string, unknown> / Record<string, string> at this
// level. Each block narrows them internally via its own typed interface.
export interface BlockProps {
  block: Block
  config: Record<string, unknown>
  t: Record<string, string>
  locale: SupportedLocaleType
  tenant: Tenant
}

// Both sync Server Components and async RSCs are valid block components.
export type BlockComponent =
  | ((props: BlockProps) => ReactNode)
  | ((props: BlockProps) => Promise<ReactNode>)

export interface BlockRegistryEntry {
  component: BlockComponent
  defaultConfig: Record<string, unknown>
  /** Translatable fields rendered by the FocusedLanguageEditor in the dashboard.
   * Collection blocks (e.g. blog-feed) leave this empty — their content
   * lives in tenant_entities and is managed via CollectionManager. */
  fields?: Array<{ key: string; label: string; inputType: 'input' | 'textarea' }>
}

export type BlockRegistry = Partial<Record<BlockKind, BlockRegistryEntry>>

// ── Translation fallback chain ─────────────────────────────────────────────────
// Priority: requested locale → tenant.defaultLocale → 'en' → {}
export function resolveBlockT(
  translations: unknown,
  locale: SupportedLocaleType,
  defaultLocale: string,
): Record<string, string> {
  const map = (translations ?? {}) as Record<string, Record<string, string>>
  return map[locale] ?? map[defaultLocale] ?? map['en'] ?? {}
}
