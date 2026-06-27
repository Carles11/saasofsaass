"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { consumePendingInvite } from "@/3-features/team-management/actions/pendingInvite";

/**
 * Runs once on dashboard load: if a pending invitation token is remembered (and
 * the signed-in user's email matches it), it is accepted and the user is routed
 * to their sites. No-op when there's no pending invite.
 */
export function PendingInviteConsumer({ locale }: { locale: string }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void consumePendingInvite().then((r) => {
      if (r.status === "accepted") {
        router.push(`/${locale}/sites`);
        router.refresh();
      }
    });
  }, [locale, router]);

  return null;
}
