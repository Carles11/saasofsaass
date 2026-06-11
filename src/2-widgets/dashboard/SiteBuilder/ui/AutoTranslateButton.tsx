'use client'


import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/soss/ui/button'
import { triggerTenantTranslation } from '@/3-features/auto-translate-content'
import { useStore } from '@/5-shared/store'
import { useRouter } from 'next/navigation'

interface AutoTranslateButtonProps {
  tenantId: string
}

export function AutoTranslateButton({ tenantId }: AutoTranslateButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  // Zustand atomic update
  const updateTranslationStatus = useStore((state) => state.updateTranslationStatus);

  async function handleTranslation() {
    updateTranslationStatus(true, 10);
    // Mock progress updates
    await new Promise((res) => setTimeout(res, 400));
    updateTranslationStatus(true, 30);
    await new Promise((res) => setTimeout(res, 400));
    updateTranslationStatus(true, 60);
    await new Promise((res) => setTimeout(res, 400));
    updateTranslationStatus(true, 90);
    await new Promise((res) => setTimeout(res, 400));
  }

  function handleClick() {
    startTransition(async () => {
      try {
        // Start progress bar
        const progressPromise = handleTranslation();
        const { succeeded, failed, remaining, rateLimitRetryAfter } = await triggerTenantTranslation(tenantId);
        await progressPromise;
        updateTranslationStatus(false, 100);
        // Refresh router to get new translations
        router.refresh();

        if (rateLimitRetryAfter) {
          toast.warning(`⏱ Gemini rate limit — retry in ${rateLimitRetryAfter}s. ${succeeded > 0 ? `(${succeeded} row${succeeded !== 1 ? 's' : ''} saved before limit)` : ''}`);
          return;
        }

        if (failed === 0 && remaining === 0) {
          toast.success(`✨ ${succeeded} row${succeeded !== 1 ? 's' : ''} translated successfully.`);
        } else if (failed > 0) {
          toast.warning(`✨ ${succeeded} succeeded, ${failed} failed. Click again to retry failed rows.`);
        } else if (remaining > 0) {
          toast.info(`✨ ${succeeded} translated. ${remaining} rows remaining — click again to continue.`);
        }
      } catch {
        updateTranslationStatus(false, 0);
        toast.error('Translation worker failed to start. Check your GEMINI_API_KEY.');
      }
    });
  }

  return (
    <Button
      sossVariant="dashboard"
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
  );
}
