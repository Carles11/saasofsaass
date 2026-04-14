import { Block } from '@/4-entities/block'
import { SupportedLocaleType } from '@/5-shared/types'

interface BlockRendererProps {
  blocks: Block[]
  locale: SupportedLocaleType
}

export function BlockRenderer({ blocks, locale }: BlockRendererProps) {
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
        <BlockSwitch key={block.id} block={block} locale={locale} />
      ))}
    </div>
  )
}

function BlockSwitch({ block, locale }: { block: Block; locale: SupportedLocaleType }) {
  // t() gives the translated strings for the active locale, falling back to 'en'
  const translations = block.translations as Record<string, Record<string, string>> | null
  const _t = translations?.[locale] ?? translations?.['en'] ?? {}

  switch (block.type) {
    // Individual block components will be added here as they are built
    // e.g. case 'hero': return <HeroBlock t={_t} config={block.config} />
    default:
      return (
        <section className="py-16 px-6 text-center border-b border-zinc-100">
          <p className="text-xs font-mono text-zinc-400">
            Block <span className="text-zinc-600 font-semibold">{block.type}</span> — not yet implemented
          </p>
        </section>
      )
  }
}
