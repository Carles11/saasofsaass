import { db } from "@/5-shared/lib/db";
import { donations } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { Gift, Landmark, Smartphone, DollarSign, Globe, Heart } from "lucide-react";
import type { BlockProps } from "../../../config/types";

interface DonationMethod {
  key: string;
  label: string;
  icon: typeof Gift;
  value: string | null;
  type: "url" | "email" | "text";
}

async function getDonationData(
  tenantId: string,
  blockId: string,
): Promise<Record<string, string | null>> {
  const [row] = await db
    .select()
    .from(donations)
    .where(eq(donations.blockId, blockId))
    .limit(1);
  if (!row) return {};
  return {
    paypalUrl: row.paypalUrl,
    bankAccountIban: row.bankAccountIban,
    bankAccountSwift: row.bankAccountSwift,
    bankAccountHolder: row.bankAccountHolder,
    bankName: row.bankName,
    bizumPhone: row.bizumPhone,
    venmoUsername: row.venmoUsername,
    giftlistUrl: row.giftlistUrl,
    honeymoonFundUrl: row.honeymoonFundUrl,
    otherMethodUrl: row.otherMethodUrl,
    otherMethodDesc: row.otherMethodDesc,
  };
}

export async function DonationsBlock({ block, locale, blockId, t }: BlockProps) {
  const data = await getDonationData(block.tenantId, block.id);
  const rawMethods: (DonationMethod & { value: string | null })[] = [
    { key: "paypalUrl", label: "PayPal", icon: DollarSign, value: data.paypalUrl, type: "url" as const },
    { key: "bank_account_iban", label: "Bank Transfer", icon: Landmark, value: data.bankAccountIban, type: "text" as const },
    { key: "bizumPhone", label: "Bizum", icon: Smartphone, value: data.bizumPhone, type: "text" as const },
    { key: "venmoUsername", label: "Venmo", icon: DollarSign, value: data.venmoUsername, type: "text" as const },
    { key: "giftlistUrl", label: "Gift List", icon: Globe, value: data.giftlistUrl, type: "url" as const },
    { key: "honeymoonFundUrl", label: "Honeymoon Fund", icon: Heart, value: data.honeymoonFundUrl, type: "url" as const },
  ];
  const methods = rawMethods.filter((m) => m.value?.trim());

  if (data.otherMethodUrl?.trim()) {
    methods.push({
      key: "otherMethodUrl",
      label: data.otherMethodDesc?.trim() || "Other",
      icon: Gift,
      value: data.otherMethodUrl,
      type: "url",
    });
  }

  if (!methods.length) return null;
  const heading = t.heading || "Make a Contribution";

  function renderMethod(method: DonationMethod) {
    const Icon = method.icon;
    const displayValue = method.value ?? undefined;

    const card = (
      <div className="flex flex-col items-center gap-2 p-5 rounded-[var(--radius)] border border-border bg-card hover:shadow-md transition-shadow min-h-[140px] h-full">
        <Icon className="h-6 w-6 text-primary shrink-0 mt-2" />
        <span className="text-sm font-medium text-card-foreground text-center leading-tight">
          {method.label}
        </span>
        {displayValue && (
          <span className="text-xs text-muted-foreground font-mono text-center break-all leading-tight mt-auto">
            {displayValue}
          </span>
        )}
      </div>
    );

    if (method.key === "paypalUrl" && method.value?.includes("@")) {
      return (
        <a key={method.key} href={`https://paypal.me/${method.value}`} target="_blank" rel="noopener noreferrer" className="block h-full">
          {card}
        </a>
      );
    }

    if (method.value && (method.value.startsWith("http") || method.value.startsWith("www"))) {
      const href = method.value.startsWith("http") ? method.value : `https://${method.value}`;
      return (
        <a key={method.key} href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
          {card}
        </a>
      );
    }

    return <div key={method.key} className="h-full">{card}</div>;
  }

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <div className="flex flex-col items-center text-center mb-12">
            <span aria-hidden className="block h-1 w-12 rounded-full bg-primary mb-6" />
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {methods.map(renderMethod)}
        </div>
      </div>
    </section>
  );
}
