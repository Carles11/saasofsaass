"use client";

import { useState } from "react";
import { useSession } from "@/5-shared/hooks/use-session";
import { createCheckoutSessionForCurrentUser } from "@/3-features/manage-billing/actions/billingActions";
import { PricingCards } from "./PricingCards";
import type { PricingTier } from "@/5-shared/lib/billing/pricing-content";

interface PricingCheckoutCardsProps {
  tiers: PricingTier[];
  labels: {
    popular: string;
    perMonth: string;
    billedAnnually: string;
    monthly: string;
    annual: string;
    save: string;
    getStarted: string;
  };
  locale: string;
  /** Sign-up URL (app domain) for logged-out visitors; `?plan=&cadence=` is appended. */
  signUpUrl: string;
}

/**
 * Pricing cards wired for the public /pricing page. Signed-in visitors go
 * straight to Stripe checkout for the chosen plan; logged-out visitors are sent
 * to sign-up carrying their selection so it can resume afterwards. The free
 * plan never starts checkout — it always routes to sign-up.
 */
export function PricingCheckoutCards({ tiers, labels, locale, signUpUrl }: PricingCheckoutCardsProps) {
  const { data: session, isPending } = useSession();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(tierId: string, annual: boolean) {
    const cadence = annual ? "annual" : "monthly";

    // Free plan or logged-out → sign-up, preserving the selection.
    if (tierId === "free" || isPending || !session) {
      const sep = signUpUrl.includes("?") ? "&" : "?";
      window.location.href = `${signUpUrl}${sep}plan=${tierId}&cadence=${cadence}`;
      return;
    }

    setPendingId(tierId);
    setError(null);
    try {
      const result = await createCheckoutSessionForCurrentUser(tierId, cadence);
      if (result.url) window.location.href = result.url;
      else setError("Could not start checkout. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <PricingCards
        tiers={tiers}
        labels={labels}
        locale={locale}
        onSelect={handleSelect}
        pendingId={pendingId}
      />
      {error && (
        <p className="mt-6 text-center text-sm text-destructive">{error}</p>
      )}
    </>
  );
}
