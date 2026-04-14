import type { ComponentType } from 'react'
import type { Block, Tenant } from '@/5-shared/lib/db/schema'
import type { SupportedLocaleType } from '@/5-shared/types'
import type { BlockKind } from '@/5-shared/types/tenants/blocks'
import { blockRegistry, resolveBlockT } from '../config/registry'
import type { BlockProps } from '../config/types'

interface BlockRendererProps {
  blocks: Block[]
  locale: SupportedLocaleType
  tenant: Tenant
}

export function BlockRenderer({ blocks, locale, tenant }: BlockRendererProps) {
  const visibleBlocks = blocks.filter(b => b.isVisible)

  if (visibleBlocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-400 text-sm">No blocks configured yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {visibleBlocks.map(block => (
        <RegistryBlock key={block.id} block={block} locale={locale} tenant={tenant} />
      ))}
    </div>
  )
}

function RegistryBlock({
  block,
  locale,
  tenant,
}: {
  block: Block
  locale: SupportedLocaleType
  tenant: Tenant
}) {
  const entry = blockRegistry[block.type as BlockKind]

  if (!entry) {
    return (
      <section className="py-16 px-6 text-center border-b border-zinc-100">
        <p className="text-xs font-mono text-zinc-400">
          Block <span className="text-zinc-600 font-semibold">{block.type}</span> — not yet implemented
        </p>
      </section>
    )
  }

  const config = { ...entry.defaultConfig, ...(block.config as Record<string, unknown>) }
  const t = resolveBlockT(block.translations, locale, tenant.defaultLocale)
  const Component = entry.component as ComponentType<BlockProps>

  return <Component block={block} config={config} t={t} locale={locale} tenant={tenant} />
}
