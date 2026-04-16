'use client'

import { useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/tenant/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  toggleBlockVisibility,
  reorderBlock,
  deleteBlock,
} from '@/3-features/manage-site-blocks'
import type { Block } from '@/5-shared/lib/db/schema'

interface BlockCardProps {
  block: Block
  tenantId: string
  isFirst: boolean
  isLast: boolean
  onEdit: (blockId: string) => void
}

export function BlockCard({ block, tenantId, isFirst, isLast, onEdit }: BlockCardProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div
      className={`flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 transition-opacity ${
        isPending ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="font-mono text-xs">
          {block.type}
        </Badge>
        {!block.isVisible && (
          <span className="text-xs text-zinc-400 italic">hidden</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Visibility toggle */}
        <Button
          tenantVariant="ghost"
          size="sm"
          disabled={isPending}
          aria-label="Toggle visibility"
          onClick={() =>
            startTransition(() => toggleBlockVisibility(block.id, tenantId, block.isVisible))
          }
        >
          {block.isVisible ? '👁' : '🙈'}
        </Button>

        {/* Reorder up */}
        {!isFirst && (
          <Button
            tenantVariant="ghost"
            size="sm"
            disabled={isPending}
            aria-label="Move up"
            onClick={() => startTransition(() => reorderBlock(tenantId, block.id, 'up'))}
          >
            ↑
          </Button>
        )}

        {/* Reorder down */}
        {!isLast && (
          <Button
            tenantVariant="ghost"
            size="sm"
            disabled={isPending}
            aria-label="Move down"
            onClick={() => startTransition(() => reorderBlock(tenantId, block.id, 'down'))}
          >
            ↓
          </Button>
        )}

        {/* Edit */}
        <Button
          tenantVariant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onEdit(block.id)}
        >
          Edit
        </Button>

        {/* Delete */}
        <Dialog>
          <DialogTrigger asChild>
            <Button tenantVariant="destructive" size="sm" disabled={isPending}>
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete &ldquo;{block.type}&rdquo; block?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-zinc-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <DialogClose asChild>
                <Button tenantVariant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  tenantVariant="destructive"
                  onClick={() => startTransition(() => deleteBlock(block.id, tenantId))}
                >
                  Confirm Delete
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
