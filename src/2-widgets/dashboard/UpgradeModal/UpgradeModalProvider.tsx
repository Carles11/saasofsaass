"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import type { PlanId } from "@/5-shared/lib/billing/plans";
import type { TranslationDict } from "@/5-shared/lib/translations/resolve";
import { UpgradeModal } from "./ui/UpgradeModal";

/** Configuration for a single upgrade-modal invocation. Feature-specific copy
 * (title/description/benefits) is resolved by the caller from its own
 * translations; the modal supplies only the generic chrome. */
export interface UpgradeConfig {
  /** Lowest plan that unlocks the feature. */
  requiredPlan: PlanId;
  title: string;
  description: string;
  benefits?: string[];
  /** False when the current user can't change the plan (not the workspace owner). */
  canUpgrade?: boolean;
  currentPlan?: string;
}

interface UpgradeModalContextValue {
  showUpgrade: (config: UpgradeConfig) => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

/** Open the shared upgrade modal from any client component under the dashboard. */
export function useUpgradeModal(): UpgradeModalContextValue {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) {
    throw new Error("useUpgradeModal must be used within <UpgradeModalProvider>");
  }
  return ctx;
}

export function UpgradeModalProvider({
  translations,
  children,
}: {
  translations?: TranslationDict;
  children: ReactNode;
}) {
  const locale = useLocale();
  const [config, setConfig] = useState<UpgradeConfig | null>(null);
  const [open, setOpen] = useState(false);

  const showUpgrade = useCallback((c: UpgradeConfig) => {
    setConfig(c);
    setOpen(true);
  }, []);

  return (
    <UpgradeModalContext.Provider value={{ showUpgrade }}>
      {children}
      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        config={config}
        translations={translations}
        locale={locale}
      />
    </UpgradeModalContext.Provider>
  );
}
