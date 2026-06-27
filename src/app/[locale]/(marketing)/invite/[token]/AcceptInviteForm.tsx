"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptInvitation } from "@/3-features/team-management/actions/invitations";
import { Button } from "@/components/ui/button";

interface AcceptInviteFormProps {
  token: string;
  locale: string;
  acceptLabel: string;
  workingLabel: string;
  errorLabel: string;
}

export function AcceptInviteForm({
  token,
  locale,
  acceptLabel,
  workingLabel,
  errorLabel,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onAccept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptInvitation(token);
      if (res.ok) {
        router.push(`/${locale}/sites`);
        router.refresh();
      } else {
        setError(errorLabel);
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button onClick={onAccept} disabled={pending} className="w-full">
        {pending ? workingLabel : acceptLabel}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
