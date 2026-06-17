"use client";

import { addCustomDomain } from "@/3-features/manage-custom-domain/actions/addCustomDomain";
import { getDomains } from "@/3-features/manage-custom-domain/actions/getDomains";
import { removeCustomDomain } from "@/3-features/manage-custom-domain/actions/removeCustomDomain";
import { verifyCustomDomain } from "@/3-features/manage-custom-domain/actions/verifyCustomDomain";
import type { TenantDomain } from "@/5-shared/lib/db/schema";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomDomainSectionProps {
  tenantId: string;
  initialDomainRows: TenantDomain[];
  plan: string;
  translations?: TranslationDict;
}

export function CustomDomainSection({
  tenantId,
  initialDomainRows,
  plan,
  translations,
}: CustomDomainSectionProps) {
  const [domainRows, setDomainRows] =
    useState<TenantDomain[]>(initialDomainRows);
  const [domainInput, setDomainInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  const isPro = plan === "pro";
  const currentDomain = domainRows[0] ?? null;

  const title = resolveTranslation(
    translations,
    "settings.domain.title",
    "Custom Domain",
  );
  const description = resolveTranslation(
    translations,
    "settings.domain.description",
    "Connect your own domain to this site. Available on the Pro plan.",
  );
  const addPlaceholder = resolveTranslation(
    translations,
    "settings.domain.input-placeholder",
    "example.com",
  );
  const addButton = resolveTranslation(
    translations,
    "settings.domain.add-button",
    "Add Domain",
  );
  const checkStatus = resolveTranslation(
    translations,
    "settings.domain.check-status",
    "Check Status",
  );
  const removeLabel = resolveTranslation(
    translations,
    "settings.domain.remove",
    "Remove",
  );
  const upgradePrompt = resolveTranslation(
    translations,
    "settings.domain.upgrade-prompt",
    "Custom domains are available on the Pro plan. Upgrade to connect your own domain.",
  );
  const dnsLabel = resolveTranslation(
    translations,
    "settings.domain.view-dns",
    "View DNS Settings",
  );
  const confirmTitle = resolveTranslation(
    translations,
    "settings.domain.confirm-remove.title",
    "Remove custom domain?",
  );
  const confirmDesc = resolveTranslation(
    translations,
    "settings.domain.confirm-remove.description",
    "This will disconnect your domain. Visitors will see your site at the default subdomain.",
  );
  const confirmButton = resolveTranslation(
    translations,
    "settings.domain.confirm-remove.confirm",
    "Remove",
  );

  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    verified: {
      label: resolveTranslation(
        translations,
        "settings.domain.status.verified",
        "Verified & Active",
      ),
      variant: "default",
    },
    pending: {
      label: resolveTranslation(
        translations,
        "settings.domain.status.pending",
        "Pending — configure DNS",
      ),
      variant: "secondary",
    },
    pending_certificate: {
      label: resolveTranslation(
        translations,
        "settings.domain.status.pending-certificate",
        "DNS configured, issuing SSL certificate...",
      ),
      variant: "secondary",
    },
    error: {
      label: resolveTranslation(
        translations,
        "settings.domain.status.error",
        "Error",
      ),
      variant: "destructive",
    },
  };

  const domainStatus = currentDomain
    ? (statusMap[currentDomain.status] ?? {
        label: currentDomain.status,
        variant: "outline" as const,
      })
    : null;

  async function handleAdd() {
    if (!domainInput.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addCustomDomain(tenantId, domainInput.trim());
      setDomainRows(await getDomains(tenantId));
      setDomainInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add domain.";
      setError(resolveTranslation(translations, msg, msg));
    } finally {
      setAdding(false);
    }
  }

  async function handleVerify(domain: string) {
    setVerifying(domain);
    setError(null);
    try {
      await verifyCustomDomain(tenantId, domain);
      setDomainRows(await getDomains(tenantId));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to verify domain.";
      setError(resolveTranslation(translations, msg, msg));
    } finally {
      setVerifying(null);
    }
  }

  async function handleRemove(domain: string) {
    setRemoving(domain);
    setError(null);
    try {
      await removeCustomDomain(tenantId, domain);
      setDomainRows(await getDomains(tenantId));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to remove domain.";
      setError(resolveTranslation(translations, msg, msg));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current domain */}
        {currentDomain && domainStatus && (
          <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {currentDomain.domain}
              </span>
              <Badge variant={domainStatus.variant}>{domainStatus.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {(currentDomain.status === "pending" ||
                currentDomain.status === "pending_certificate" ||
                currentDomain.status === "error") && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={verifying === currentDomain.domain}
                  onClick={() => handleVerify(currentDomain.domain)}
                >
                  {verifying === currentDomain.domain
                    ? "Checking..."
                    : checkStatus}
                </Button>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {removeLabel}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{confirmTitle}</DialogTitle>
                    <DialogDescription>{confirmDesc}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        disabled={removing === currentDomain.domain}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      disabled={removing === currentDomain.domain}
                      onClick={() => handleRemove(currentDomain.domain)}
                    >
                      {removing === currentDomain.domain
                        ? "Removing..."
                        : confirmButton}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* DNS instructions */}
        {currentDomain?.dnsInstructions && (
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {dnsLabel}
            </p>
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {currentDomain.dnsInstructions}
            </pre>
          </div>
        )}

        {/* Add domain input — only when no domain exists */}
        {!currentDomain && isPro && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder={addPlaceholder}
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                disabled={adding}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={adding || !domainInput.trim()}
            >
              {adding ? "Adding..." : addButton}
            </Button>
          </div>
        )}

        {/* Upgrade prompt */}
        {!currentDomain && !isPro && (
          <p className="text-sm text-muted-foreground">{upgradePrompt}</p>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
