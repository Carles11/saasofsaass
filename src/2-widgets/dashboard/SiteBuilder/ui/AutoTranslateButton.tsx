'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/soss/ui/button'
import { triggerTenantTranslation, triggerBlockTranslation, generateBlockContent } from '@/3-features/auto-translate-content'
import { useRouter } from 'next/navigation'
import { GenerateContentDialog } from './GenerateContentDialog'
import { useUpgradeModal } from '@/2-widgets/dashboard/UpgradeModal'
import { PLAN_ORDER, PLANS, isUnlimited, type PlanId } from '@/5-shared/lib/billing/plans'
import { resolveTranslation, type TranslationDict, type TranslationParams } from '@/5-shared/lib/translations/resolve'

// Lowest plan with unlimited AI translations (the upsell target for the quota gate).
const AI_UPGRADE_PLAN: PlanId =
  PLAN_ORDER.find((id) => isUnlimited(PLANS[id].limits.aiBlocksLifetime)) ?? 'pro'

interface AutoTranslateButtonProps {
  tenantId: string
  blockId?: string
  defaultLocale?: string
  onTranslate?: (isTranslating: boolean) => void
  translations?: TranslationDict
}

export function AutoTranslateButton({ tenantId, blockId, defaultLocale, onTranslate, translations }: AutoTranslateButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { showUpgrade } = useUpgradeModal();

  const t = (key: string, fallback: string, params?: TranslationParams) =>
    resolveTranslation(translations, key, fallback, params);

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
          const rateMsg = result.succeeded > 0
            ? t("settings.auto-translate.rate-limit-with-saved", "⏱ Gemini rate limit — retry in {seconds}s. ({count} row(s) saved before limit)", { seconds: String(result.rateLimitRetryAfter), count: String(result.succeeded) })
            : t("settings.auto-translate.rate-limit", "⏱ Gemini rate limit — retry in {seconds}s.", { seconds: String(result.rateLimitRetryAfter) });
          toast.warning(rateMsg);
          return;
        }

        if (result.quotaReached) {
          if (result.succeeded > 0) {
            toast.success(t("settings.auto-translate.quota-reached", "✨ {count} translated — you've reached your plan's AI limit.", { count: String(result.succeeded) }));
          }
          showUpgrade({
            requiredPlan: AI_UPGRADE_PLAN,
            title: t("settings.auto-translate.upgrade-title", "Unlimited AI translations"),
            description: t("settings.auto-translate.upgrade-desc", "You've used your plan's AI translation allowance. Upgrade for unlimited AI-powered translations across all your sites."),
            benefits: [
              t("settings.auto-translate.upgrade-benefit-1", "Unlimited AI translations"),
              t("settings.auto-translate.upgrade-benefit-2", "Translate every block and entity instantly"),
              t("settings.auto-translate.upgrade-benefit-3", "Reach visitors in all 8 supported languages"),
            ],
            canUpgrade: true,
          });
          return;
        }

        if (result.failed === 0 && result.remaining === 0) {
          if (result.totalJobCount > 0) {
            toast.success(t("settings.auto-translate.success", "✨ {count} row(s) translated successfully.", { count: String(result.succeeded) }));
          } else {
            toast(t("settings.auto-translate.nothing-to-translate", "Nothing to translate."));
          }
        } else if (result.failed > 0) {
          toast.warning(t("settings.auto-translate.partial-failure", "✨ {succeeded} succeeded, {failed} failed. Click again to retry failed rows.", { succeeded: String(result.succeeded), failed: String(result.failed) }));
        } else if (result.remaining > 0) {
          toast.info(t("settings.auto-translate.rows-remaining", "✨ {count} translated. {remaining} rows remaining — click again to continue.", { count: String(result.succeeded), remaining: String(result.remaining) }));
        }
      } catch {
        toast.error(t("settings.auto-translate.worker-error", "Translation worker failed to start. Check your GEMINI_API_KEY."));
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
      toast.success(t("settings.auto-translate.generated", "✨ {count} item(s) generated. Translating…", { count: String(generated) }));
      setShowGenerateDialog(false);

      const transResult = await triggerBlockTranslation(blockId!, tenantId);
      router.refresh();

      if (transResult.rateLimitRetryAfter) {
        const rateMsg = transResult.succeeded > 0
          ? t("settings.auto-translate.rate-limit-with-saved", "⏱ Gemini rate limit — retry in {seconds}s. ({count} row(s) saved before limit)", { seconds: String(transResult.rateLimitRetryAfter), count: String(transResult.succeeded) })
          : t("settings.auto-translate.rate-limit", "⏱ Gemini rate limit — retry in {seconds}s.", { seconds: String(transResult.rateLimitRetryAfter) });
        toast.warning(rateMsg);
      } else if (transResult.failed === 0 && transResult.remaining === 0) {
        toast.success(t("settings.auto-translate.success", "✨ {count} row(s) translated successfully.", { count: String(transResult.succeeded) }));
      } else if (transResult.failed > 0) {
        toast.warning(t("settings.auto-translate.partial-failure", "✨ {succeeded} succeeded, {failed} failed. Click again to retry failed rows.", { succeeded: String(transResult.succeeded), failed: String(transResult.failed) }));
      }
    } catch {
      toast.error(t("settings.auto-translate.generate-error", "Failed to generate content."));
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
            {t("settings.auto-translate.translating", "Translating…")}
          </>
        ) : (
          t("settings.auto-translate.button-label", "✨ Auto-Translate")
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
