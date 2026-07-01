"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addExtraSite } from "@/3-features/manage-billing/actions/billingActions";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";

interface AddExtraSiteButtonProps {
  workspaceId: string;
  /** Current purchased add-on quantity. Disables the button at the soft cap. */
  addonSites: number;
  /** EXTRA_SITE.softCap — passed in so this stays a dumb presentational widget. */
  softCap: number;
  /** Called after a successful add so the parent can refresh server data. */
  onAdded?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  translations?: TranslationDict;
  /** Override label (e.g. for the publish-cap dialog where copy differs). */
  label?: string;
}

export function AddExtraSiteButton({
  workspaceId,
  addonSites,
  softCap,
  onAdded,
  variant = "outline",
  size = "sm",
  translations,
  label,
}: AddExtraSiteButtonProps) {
  const [loading, setLoading] = useState(false);
  const atCap = addonSites >= softCap;

  const handleClick = useCallback(async () => {
    setLoading(true);
    try {
      await addExtraSite(workspaceId);
      toast.success(
        resolveTranslation(
          translations,
          "add-extra-site.success",
          "Extra site added. Proration will appear on your next invoice.",
        ),
      );
      onAdded?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? resolveTranslation(translations, err.message, err.message)
          : resolveTranslation(
              translations,
              "add-extra-site.error",
              "Could not add an extra site.",
            );
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, onAdded, translations]);

  const text =
    label ??
    resolveTranslation(
      translations,
      "add-extra-site.cta",
      "Add a site — €19/mo",
    );

  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading || atCap}
      onClick={handleClick}
    >
      {loading
        ? resolveTranslation(translations, "add-extra-site.adding", "Adding…")
        : text}
    </Button>
  );
}
