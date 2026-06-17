'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/soss/ui/button'
import { triggerTenantTranslation, triggerBlockTranslation, generateBlockContent } from '@/3-features/auto-translate-content'
import { useRouter } from 'next/navigation'
import { GenerateContentDialog } from './GenerateContentDialog'

interface AutoTranslateButtonProps {
  tenantId: string
  blockId?: string
  defaultLocale?: string
  onTranslate?: (isTranslating: boolean) => void
}

export function AutoTranslateButton({ tenantId, blockId, defaultLocale, onTranslate }: AutoTranslateButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  function handleClick() {
    onTranslate?.(true);
    startTransition(async () => {
      try {
        const translate = blockId
          ? triggerBlockTranslation(blockId, tenantId)
          : triggerTenantTranslation(tenantId);
        const result = await translate;

        if (result.needsSeed && blockId) {
          setShowGenerateDialog(true);
          return;
        }

        router.refresh();

        if (result.rateLimitRetryAfter) {
          toast.warning(`⏱ Gemini rate limit — retry in ${result.rateLimitRetryAfter}s. ${result.succeeded > 0 ? `(${result.succeeded} row${result.succeeded !== 1 ? 's' : ''} saved before limit)` : ''}`);
          return;
        }

        if (result.failed === 0 && result.remaining === 0) {
          if (result.totalJobCount > 0) {
            toast.success(`✨ ${result.succeeded} row${result.succeeded !== 1 ? 's' : ''} translated successfully.`);
          } else {
            toast('Nothing to translate.');
          }
        } else if (result.failed > 0) {
          toast.warning(`✨ ${result.succeeded} succeeded, ${result.failed} failed. Click again to retry failed rows.`);
        } else if (result.remaining > 0) {
          toast.info(`✨ ${result.succeeded} translated. ${result.remaining} rows remaining — click again to continue.`);
        }
      } catch {
        toast.error('Translation worker failed to start. Check your GEMINI_API_KEY.');
      } finally {
        onTranslate?.(false);
      }
    });
  }

  async function handleGenerateConfirm() {
    onTranslate?.(true);
    setIsGenerating(true);
    try {
      const { generated } = await generateBlockContent(blockId!, tenantId);
      toast.success(`✨ ${generated} item${generated !== 1 ? 's' : ''} generated. Translating…`);
      setShowGenerateDialog(false);

      const transResult = await triggerBlockTranslation(blockId!, tenantId);
      router.refresh();

      if (transResult.rateLimitRetryAfter) {
        toast.warning(`⏱ Gemini rate limit — retry in ${transResult.rateLimitRetryAfter}s. ${transResult.succeeded > 0 ? `(${transResult.succeeded} row${transResult.succeeded !== 1 ? 's' : ''} saved before limit)` : ''}`);
      } else if (transResult.failed === 0 && transResult.remaining === 0) {
        toast.success(`✨ ${transResult.succeeded} row${transResult.succeeded !== 1 ? 's' : ''} translated successfully.`);
      } else if (transResult.failed > 0) {
        toast.warning(`✨ ${transResult.succeeded} succeeded, ${transResult.failed} failed. Click again to retry failed rows.`);
      }
    } catch {
      toast.error('Failed to generate content.');
    } finally {
      setIsGenerating(false);
      onTranslate?.(false);
    }
  }

  return (
    <>
      <Button
        sossVariant="dashboard"
        variant="outline"
        size="sm"
        disabled={isPending || isGenerating}
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

      {defaultLocale && (
        <GenerateContentDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          onConfirm={handleGenerateConfirm}
          defaultLocale={defaultLocale}
          isPending={isGenerating}
        />
      )}
    </>
  );
}
