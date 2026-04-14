'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LanguageSelector } from './LanguageSelector'
import { BlockList } from './BlockList'
import { BlockEditSheet } from './BlockEditSheet'
import { CollectionManager } from './CollectionManager'
import { AutoTranslateButton } from './AutoTranslateButton'
import type { Block, Tenant, TenantEntity, TenantTranslation } from '@/5-shared/lib/db/schema'
import type { SupportedLocaleType } from '@/5-shared/types'

type EntityRow = { entity: TenantEntity; translation: TenantTranslation | null }

interface SiteBuilderProps {
  tenant: Tenant
  blocks: Block[]
  initialEntities: EntityRow[]
}

export function SiteBuilder({ tenant, blocks, initialEntities }: SiteBuilderProps) {
  const [activeLocale, setActiveLocale] = useState<SupportedLocaleType>(
    tenant.defaultLocale as SupportedLocaleType,
  )
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) ?? null

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
            onChange={setActiveLocale}
          />
        </div>
      </div>

      {/* ── Main tabs ───────────────────────────────────────────────── */}
      <Tabs defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="mt-4">
          <BlockList
            blocks={blocks}
            tenantId={tenant.id}
            onEdit={setSelectedBlockId}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <CollectionManager
            tenant={tenant}
            activeLocale={activeLocale}
            initialEntities={initialEntities}
          />
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
  )
}
