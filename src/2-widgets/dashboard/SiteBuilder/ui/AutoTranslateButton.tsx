'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { triggerTenantTranslation } from '@/3-features/auto-translate-content'

interface AutoTranslateButtonProps {
  tenantId: string
}

export function AutoTranslateButton({ tenantId }: AutoTranslateButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        const { succeeded, failed, remaining } = await triggerTenantTranslation(tenantId)

        if (failed === 0 && remaining === 0) {
          toast.success(`✨ ${succeeded} row${succeeded !== 1 ? 's' : ''} translated successfully.`)
        } else if (failed > 0) {
          toast.warning(
            `✨ ${succeeded} succeeded, ${failed} failed. Click again to retry failed rows.`,
          )
        } else if (remaining > 0) {
          toast.info(
            `✨ ${succeeded} translated. ${remaining} rows remaining — click again to continue.`,
          )
        }
      } catch {
        toast.error('Translation worker failed to start. Check your GEMINI_API_KEY.')
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      className="gap-2"
    >
      {isPending ? (
        <>
          <span className="animate-spin">✦</span>
          Translating…
        </>
      ) : (
        '✨ Auto-Translate'
      )}
    </Button>
  )
}
