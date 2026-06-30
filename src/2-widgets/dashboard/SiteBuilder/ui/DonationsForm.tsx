"use client";

import { saveDonations, getDonations } from "@/3-features/manage-site-blocks";
import type { DonationFields } from "@/3-features/manage-site-blocks";
import { toast } from "@/5-shared/lib/ui/toast";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

interface DonationsFormProps {
  blockId: string;
  tenantId: string;
  translations?: TranslationDict;
  onSuccess?: () => void;
}

type SectionDef = {
  key: keyof DonationFields;
  labelKey: string;
  labelFallback: string;
  placeholder: string;
};

const SECTIONS: { titleKey: string; titleFallback: string; fields: SectionDef[] }[] = [
  {
    titleKey: "donations.section.paypal",
    titleFallback: "PayPal",
    fields: [
      { key: "paypalUrl", labelKey: "donations.paypal_url", labelFallback: "PayPal link or email", placeholder: "https://paypal.me/..." },
    ],
  },
  {
    titleKey: "donations.section.bank",
    titleFallback: "Bank Transfer",
    fields: [
      { key: "bankAccountHolder", labelKey: "donations.bank_holder", labelFallback: "Account holder", placeholder: "John Doe" },
      { key: "bankName", labelKey: "donations.bank_name", labelFallback: "Bank name", placeholder: "" },
      { key: "bankAccountIban", labelKey: "donations.bank_iban", labelFallback: "IBAN", placeholder: "ES00 0000 0000 0000 0000 0000" },
      { key: "bankAccountSwift", labelKey: "donations.bank_swift", labelFallback: "SWIFT / BIC", placeholder: "BICXXXYY" },
    ],
  },
  {
    titleKey: "donations.section.mobile",
    titleFallback: "Mobile Payments",
    fields: [
      { key: "bizumPhone", labelKey: "donations.bizum", labelFallback: "Bizum phone number", placeholder: "+34 600 000 000" },
      { key: "venmoUsername", labelKey: "donations.venmo", labelFallback: "Venmo username", placeholder: "@username" },
    ],
  },
  {
    titleKey: "donations.section.links",
    titleFallback: "Links",
    fields: [
      { key: "giftlistUrl", labelKey: "donations.giftlist", labelFallback: "Gift list URL", placeholder: "https://..." },
      { key: "honeymoonFundUrl", labelKey: "donations.honeymoon", labelFallback: "Honeymoon fund URL", placeholder: "https://..." },
    ],
  },
  {
    titleKey: "donations.section.other",
    titleFallback: "Other",
    fields: [
      { key: "otherMethodDesc", labelKey: "donations.other_desc", labelFallback: "Description", placeholder: "e.g. Cryptocurrency" },
      { key: "otherMethodUrl", labelKey: "donations.other_url", labelFallback: "URL", placeholder: "https://..." },
    ],
  },
];

export function DonationsForm({
  blockId,
  tenantId,
  translations,
  onSuccess,
}: DonationsFormProps) {
  const [data, setData] = useState<DonationFields>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  useEffect(() => {
    getDonations(blockId, tenantId)
      .then((row) => {
        if (row) {
          setData({
            paypalUrl: row.paypalUrl ?? undefined,
            bankAccountIban: row.bankAccountIban ?? undefined,
            bankAccountSwift: row.bankAccountSwift ?? undefined,
            bankAccountHolder: row.bankAccountHolder ?? undefined,
            bankName: row.bankName ?? undefined,
            bizumPhone: row.bizumPhone ?? undefined,
            venmoUsername: row.venmoUsername ?? undefined,
            giftlistUrl: row.giftlistUrl ?? undefined,
            honeymoonFundUrl: row.honeymoonFundUrl ?? undefined,
            otherMethodUrl: row.otherMethodUrl ?? undefined,
            otherMethodDesc: row.otherMethodDesc ?? undefined,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [blockId, tenantId]);

  function setField(key: keyof DonationFields, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveDonations(blockId, tenantId, data);
      toast({
        title: t("donations.saved", "Donation methods saved."),
        status: "success",
      });
      onSuccess?.();
    } catch {
      toast({
        title: t("donations.save-failed", "Could not save donation methods."),
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("donations.loading", "Loading…")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {SECTIONS.map((section) => (
        <div key={section.titleKey}>
          <Separator className="mb-4" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {t(section.titleKey, section.titleFallback)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={`don-${field.key}`}>
                  {t(field.labelKey, field.labelFallback)}
                </Label>
                <Input
                  id={`don-${field.key}`}
                  value={data[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 -mx-4 mt-2 border-t border-border bg-popover px-4 py-3">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving
            ? t("donations.saving", "Saving…")
            : t("donations.save", "Save Donation Methods")}
        </Button>
      </div>
    </div>
  );
}
