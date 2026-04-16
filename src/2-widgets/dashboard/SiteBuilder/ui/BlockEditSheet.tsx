'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/tenant/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { updateBlockTranslations, updateBlockConfig } from '@/3-features/manage-site-blocks'
import { blockFields } from '@/2-widgets/tenant/BlockRenderer/config/block-fields'
import { isRtl } from '@/5-shared/lib/next/rtl'
import type { Block, Tenant } from '@/5-shared/lib/db/schema'
import type { SupportedLocaleType } from '@/5-shared/types'
import type { BlockKind } from '@/5-shared/types/tenants/blocks'

// Config fields that are non-translatable, per block type
const CONFIG_FIELDS: Partial<
  Record<BlockKind, Array<{ key: string; label: string }>>
> = {
  hero: [
    { key: 'ctaUrl', label: 'CTA URL' },
    { key: 'layout', label: 'Layout (centered / left-aligned)' },
  ],
}

interface BlockEditSheetProps {
  block: Block | null
  tenant: Tenant
  activeLocale: SupportedLocaleType
  open: boolean
  onClose: () => void
}

export function BlockEditSheet({
  block,
  tenant,
  activeLocale,
  open,
  onClose,
}: BlockEditSheetProps) {
  if (!block) return null

  const entry    = blockFields[block.type as BlockKind]
  const fields   = entry ?? []
  const cfFields = CONFIG_FIELDS[block.type as BlockKind] ?? []

  const translations = (block.translations ?? {}) as Record<string, Record<string, string>>
  const current = translations[activeLocale] ?? translations[tenant.defaultLocale] ?? {}
  const config  = (block.config ?? {}) as Record<string, unknown>

  const dir = isRtl(activeLocale) ? 'rtl' : 'ltr'

  async function handleTranslationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, string> = {}
    for (const field of fields) {
      payload[field.key] = (fd.get(field.key) as string) ?? ''
    }
    await updateBlockTranslations(block!.id, tenant.id, activeLocale, payload)
    onClose()
  }

  async function handleConfigSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newConfig: Record<string, unknown> = { ...(block!.config as Record<string, unknown>) }
    for (const f of cfFields) {
      newConfig[f.key] = fd.get(f.key) ?? ''
    }
    await updateBlockConfig(block!.id, tenant.id, newConfig)
  }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Edit &ldquo;{block.type}&rdquo; &mdash; {activeLocale.toUpperCase()}
          </SheetTitle>
        </SheetHeader>

        {/* ── Translation fields ─────────────────────────────────────── */}
        {fields.length > 0 && (
          <form
            onSubmit={handleTranslationSubmit}
            className="flex flex-col gap-4 mt-6"
            dir={dir}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Translations
            </p>
            {fields.map(field => (
              <div key={field.key} className="flex flex-col gap-1">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.inputType === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    defaultValue={current[field.key] ?? ''}
                    rows={4}
                    dir={dir}
                  />
                ) : (
                  <Input
                    id={field.key}
                    name={field.key}
                    defaultValue={current[field.key] ?? ''}
                    dir={dir}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="mt-2">
              Save Translations
            </Button>
          </form>
        )}

        {/* ── Config fields (non-translatable) ──────────────────────── */}
        {cfFields.length > 0 && (
          <>
            <Separator className="my-6" />
            <form onSubmit={handleConfigSubmit} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Settings
              </p>
              {cfFields.map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <Label htmlFor={`cfg-${f.key}`}>{f.label}</Label>
                  <Input
                    id={`cfg-${f.key}`}
                    name={f.key}
                    defaultValue={
                      typeof config[f.key] === 'string' ? (config[f.key] as string) : ''
                    }
                  />
                </div>
              ))}
              <Button type="submit" variant="outline">
                Save Settings
              </Button>
            </form>
          </>
        )}

        {fields.length === 0 && cfFields.length === 0 && (
          <p className="mt-6 text-sm text-zinc-400">
            This block has no editable fields. Manage its content in the Content tab.
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}
