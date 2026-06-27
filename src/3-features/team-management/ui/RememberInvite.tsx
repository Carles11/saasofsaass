"use client";

import { useEffect } from "react";
import { setPendingInvite } from "@/3-features/team-management/actions/pendingInvite";

/**
 * Persists the invitation token to a cookie when an invitee views the accept
 * page but isn't yet able to accept (not signed in, or signed in with the wrong
 * email). After they authenticate, PendingInviteConsumer finishes the job.
 */
export function RememberInvite({ token }: { token: string }) {
  useEffect(() => {
    void setPendingInvite(token);
  }, [token]);
  return null;
}
