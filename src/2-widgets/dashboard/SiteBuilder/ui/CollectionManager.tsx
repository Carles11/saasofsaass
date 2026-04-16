'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/tenant/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createEntity, publishEntity, updateEntityTranslation } from '@/3-features/manage-entities'
import { isRtl } from '@/5-shared/lib/next/rtl'
import type { Tenant, TenantEntity, TenantTranslation } from '@/5-shared/lib/db/schema'
import type { EntityKind } from '@/5-shared/types/tenants/entities'
import type { SupportedLocaleType } from '@/5-shared/types'

type EntityRow = { entity: TenantEntity; translation: TenantTranslation | null }

interface CollectionManagerProps {
  tenant: Tenant
  activeLocale: SupportedLocaleType
  initialEntities: EntityRow[]
}

const ENTITY_KINDS: EntityKind[] = ['blog_post', 'podcast_episode', 'award_item']

export function CollectionManager({
  tenant,
  activeLocale,
  initialEntities,
}: CollectionManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [newKind, setNewKind] = useState<EntityKind>('blog_post')
  const [newSlug, setNewSlug] = useState('')
  const dir = isRtl(activeLocale) ? 'rtl' : 'ltr'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newSlug.trim()) return
    await createEntity({ tenantId: tenant.id, kind: newKind, slug: newSlug.trim() })
    setNewSlug('')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Create new entity ──────────────────────────────────────── */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-300"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          New Item
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-35">
            <Label>Kind</Label>
            <Select value={newKind} onValueChange={v => setNewKind(v as EntityKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_KINDS.map(k => (
                  <SelectItem key={k} value={k}>
                    {k.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <Label>Slug</Label>
            <Input
              value={newSlug}
              onChange={e => setNewSlug(e.target.value)}
              placeholder="my-first-post"
              pattern="[a-z0-9-]+"
              title="lowercase letters, numbers and hyphens only"
            />
          </div>
          <Button type="submit" tenantVariant="default" disabled={isPending || !newSlug.trim()}>
            Create
          </Button>
        </div>
      </form>

      <Separator />

      {/* ── Entity list ────────────────────────────────────────────── */}
      {initialEntities.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-8">
          No content yet. Create your first item above.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {initialEntities.map(({ entity, translation }) => (
          <EntityRow
            key={entity.id}
            entity={entity}
            translation={translation}
            tenantId={tenant.id}
            activeLocale={activeLocale}
            dir={dir}
          />
        ))}
      </div>
    </div>
  )
}

// ── EntityRow ──────────────────────────────────────────────────────────────────

interface EntityRowProps {
  entity: TenantEntity
  translation: TenantTranslation | null
  tenantId: string
  activeLocale: SupportedLocaleType
  dir: 'ltr' | 'rtl'
}

function EntityRow({ entity, translation, tenantId, activeLocale, dir }: EntityRowProps) {
  const [isPending, startTransition] = useTransition()
  const payload = (translation?.payload ?? {}) as Record<string, string>
  const displayTitle = payload.title ?? entity.slug ?? entity.id

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {entity.kind}
          </Badge>
          <span className="text-sm font-medium text-zinc-800 truncate max-w-50">
            {displayTitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={entity.status === 'published' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {entity.status}
          </Badge>
          {translation ? (
            <TranslationStatusBadge status={translation.translationStatus} />
          ) : (
            <span className="text-xs text-amber-500">no translation for {activeLocale}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Edit translation */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              Edit ({activeLocale})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div dir={dir}>
              <DialogHeader>
                <DialogTitle>
                  Edit Translation &mdash; {activeLocale.toUpperCase()}
                </DialogTitle>
              </DialogHeader>
              <TranslationForm
                entity={entity}
                tenantId={tenantId}
                activeLocale={activeLocale}
                currentPayload={payload}
                dir={dir}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Publish */}
        {entity.status !== 'published' && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => publishEntity(entity.id, tenantId))}
          >
            Publish
          </Button>
        )}
      </div>
    </div>
  )
}

// ── TranslationForm ──────────────────────────────────────────────────────────

interface TranslationFormProps {
  entity: TenantEntity
  tenantId: string
  activeLocale: SupportedLocaleType
  currentPayload: Record<string, string>
  dir: 'ltr' | 'rtl'
}

function TranslationForm({
  entity,
  tenantId,
  activeLocale,
  currentPayload,
  dir,
}: TranslationFormProps) {
  const isBlog    = entity.kind === 'blog_post'
  const isPodcast = entity.kind === 'podcast_episode'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, string> = {}
    for (const [k, v] of fd.entries()) {
      payload[k] = v as string
    }
    await updateEntityTranslation(entity.id, tenantId, activeLocale, payload)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4" dir={dir}>
      <div className="flex flex-col gap-1">
        <Label htmlFor="et-title">Title</Label>
        <Input
          id="et-title"
          name="title"
          defaultValue={currentPayload.title ?? ''}
          dir={dir}
          required
        />
      </div>

      {(isBlog || isPodcast) && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-excerpt">
            {isBlog ? 'Excerpt' : 'Description'}
          </Label>
          <Textarea
            id="et-excerpt"
            name={isBlog ? 'excerpt' : 'description'}
            defaultValue={
              isBlog ? (currentPayload.excerpt ?? '') : (currentPayload.description ?? '')
            }
            rows={3}
            dir={dir}
          />
        </div>
      )}

      {!isBlog && !isPodcast && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-desc">Description</Label>
          <Textarea
            id="et-desc"
            name="description"
            defaultValue={currentPayload.description ?? ''}
            rows={3}
            dir={dir}
          />
        </div>
      )}

      {isBlog && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-slug">Localized Slug</Label>
          <Input
            id="et-slug"
            name="localizedSlug"
            defaultValue={currentPayload.localizedSlug ?? ''}
          />
        </div>
      )}

      <DialogClose asChild>
        <Button type="submit" className="mt-2">
          Save Translation
        </Button>
      </DialogClose>
    </form>
  )
}

// ── Translation Status Badge ───────────────────────────────────────────────────

type TranslationStatus = 'pending' | 'translated' | 'failed' | 'locked'

const STATUS_CONFIG: Record<
  TranslationStatus,
  { label: string; icon: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending:    { label: 'pending',    icon: '⏳', variant: 'secondary' },
  translated: { label: 'translated', icon: '✓',  variant: 'default' },
  failed:     { label: 'failed',     icon: '✗',  variant: 'destructive' },
  locked:     { label: 'locked',     icon: '🔒', variant: 'outline' },
}

function TranslationStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as TranslationStatus] ?? {
    label: status,
    icon: '?',
    variant: 'outline' as const,
  }
  return (
    <Badge variant={cfg.variant} className="gap-1 text-xs">
      {cfg.icon} {cfg.label}
    </Badge>
  )
}
