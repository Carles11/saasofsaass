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
import { CheckCircle2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { DnsInstructionsModal } from "./DnsInstructionsModal";


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
  const [dnsModalOpen, setDnsModalOpen] = useState(false);

  const isPro = plan === "pro";
  const currentDomain = domainRows[0] ?? null;

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  const title = t("settings.domain.title", "Custom Domain");
  const description = t(
    "settings.domain.description",
    "Connect your own domain to this site. Available on the Pro plan.",
  );
  const addPlaceholder = t("settings.domain.input-placeholder", "example.com");
  const addButton = t("settings.domain.add-button", "Add Domain");
  const checkStatus = t("settings.domain.check-status", "Check Status");
  const removeLabel = t("settings.domain.remove", "Remove");
  const upgradePrompt = t(
    "settings.domain.upgrade-prompt",
    "Custom domains are available on the Pro plan. Upgrade to connect your own domain.",
  );
  const confirmTitle = t(
    "settings.domain.confirm-remove.title",
    "Remove custom domain?",
  );
  const confirmDesc = t(
    "settings.domain.confirm-remove.description",
    "This will disconnect your domain. Visitors will see your site at the default subdomain.",
  );
  const confirmButton = t("settings.domain.confirm-remove.confirm", "Remove");

  // ── Verified-state panel labels ──────────────────────────────────────
  const verifiedHeading = t(
    "settings.domain.verified-panel.heading",
    "Your domain is live!",
  );
  const verifiedBody = t(
    "settings.domain.verified-panel.body",
    "Everything is configured correctly, your visitors can reach your site at this address.",
  );
  const visitSiteLabel = t(
    "settings.domain.verified-panel.visit-site",
    "Visit Site",
  );
  const dnsSettingsLabel = t(
    "settings.domain.verified-panel.dns-settings",
    "DNS Settings",
  );

  // ── Pending-certificate panel labels ─────────────────────────────────
  const almostReadyHeading = t(
    "settings.domain.pending-cert-panel.heading",
    "Almost Ready",
  );
  const almostReadyBody = t(
    "settings.domain.pending-cert-panel.body",
    "DNS is configured correctly. We're now issuing an SSL certificate — this usually takes a few minutes. You don't need to do anything else.",
  );

  // ── Status badge labels ──────────────────────────────────────────────
  const statusLabels: Record<string, string> = {
    verified: t("settings.domain.status.verified", "Verified & Active"),
    pending: t("settings.domain.status.pending", "Pending — configure DNS"),
    pending_certificate: t(
      "settings.domain.status.pending-certificate",
      "DNS configured, issuing SSL certificate...",
    ),
    error: t("settings.domain.status.error", "Error"),
  };

  const checkingLabel = t("settings.domain.checking", "Checking...");
  const removingLabel = t("settings.domain.removing", "Removing...");
  const addingLabel = t("settings.domain.adding", "Adding...");
  const cancelLabel = t("cancel", "Cancel");

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

  // ── Render helpers ───────────────────────────────────────────────────

  function renderRemoveDialog() {
    if (!currentDomain) return null;
    return (
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
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={removing === currentDomain.domain}
              onClick={() => handleRemove(currentDomain.domain)}
            >
              {removing === currentDomain.domain
                ? removingLabel
                : confirmButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderDnsModalTrigger() {
    return (
      <Button variant="outline" size="sm" onClick={() => setDnsModalOpen(true)}>
        {dnsSettingsLabel}
      </Button>
    );
  }

  function renderDomainPanel() {
    if (!currentDomain) return null;
    switch (currentDomain.status) {
      case "verified":
        return (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    {verifiedHeading}
                  </p>
                  <Badge variant="default">{statusLabels.verified}</Badge>
                </div>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  {verifiedBody}
                </p>
                <p className="mt-1 text-sm font-medium text-green-800 dark:text-green-200">
                  {currentDomain.domain}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={`https://${currentDomain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="default" size="sm">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      {visitSiteLabel}
                    </Button>
                  </a>
                  {renderDnsModalTrigger()}
                  {renderRemoveDialog()}
                </div>
              </div>
            </div>
          </div>
        );

      case "pending_certificate":
        return (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {almostReadyHeading}
                  </p>
                  <Badge variant="secondary">
                    {statusLabels.pending_certificate}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {almostReadyBody}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentDomain.domain}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={verifying === currentDomain.domain}
                    onClick={() => handleVerify(currentDomain.domain)}
                  >
                    {verifying === currentDomain.domain ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        {checkingLabel}
                      </>
                    ) : (
                      checkStatus
                    )}
                  </Button>
                  {renderDnsModalTrigger()}
                  {renderRemoveDialog()}
                </div>
              </div>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {currentDomain.domain}
              </span>
              <Badge variant="secondary">{statusLabels.pending}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={verifying === currentDomain.domain}
                onClick={() => handleVerify(currentDomain.domain)}
              >
                {verifying === currentDomain.domain
                  ? checkingLabel
                  : checkStatus}
              </Button>
              {renderDnsModalTrigger()}
              {renderRemoveDialog()}
            </div>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-red-900">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {currentDomain.domain}
              </span>
              <Badge variant="destructive">{statusLabels.error}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={verifying === currentDomain.domain}
                onClick={() => handleVerify(currentDomain.domain)}
              >
                {verifying === currentDomain.domain
                  ? checkingLabel
                  : checkStatus}
              </Button>
              {renderRemoveDialog()}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // ── Flatten translations for modal ───────────────────────────────────
  const modalTxt: Record<string, string> = {};
  if (translations) {
    const modalKeys = [
      "settings.domain.dns-modal.title",
      "settings.domain.dns-modal.description",
      "settings.domain.dns-modal.step-label",
      "settings.domain.dns-modal.type-label",
      "settings.domain.dns-modal.name-label",
      "settings.domain.dns-modal.value-label",
      "settings.domain.dns-modal.copy",
      "settings.domain.dns-modal.copied",
      "settings.domain.dns-modal.guide-link",
      "settings.domain.dns-modal.registrar-link",
      "settings.domain.dns-modal.no-dns-heading",
      "settings.domain.dns-modal.delegate-button",
      "settings.domain.delegate.subject",
      "settings.domain.delegate.body",
    ];
    for (const key of modalKeys) {
      modalTxt[key] = resolveTranslation(translations, key, key);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderDomainPanel()}

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
                {adding ? addingLabel : addButton}
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

      {currentDomain && (
        <DnsInstructionsModal
          open={dnsModalOpen}
          onOpenChange={setDnsModalOpen}
          domain={currentDomain.domain}
          dnsInstructions={currentDomain.dnsInstructions}
          txt={modalTxt}
        />
      )}
    </>
  );
}
