"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { DnsRecord } from "./parseDnsRecords";

interface DnsRecordCardProps {
  step: number;
  record: DnsRecord;
  stepLabel: string;
  typeLabel: string;
  nameLabel: string;
  valueLabel: string;
  copyLabel: string;
  copiedLabel: string;
}

const RECORD_COLORS: Record<string, string> = {
  A: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  CNAME:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  TXT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  MX: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  AAAA: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

export function DnsRecordCard({
  step,
  record,
  stepLabel,
  typeLabel,
  nameLabel,
  valueLabel,
  copyLabel,
  copiedLabel,
}: DnsRecordCardProps) {
  const [copiedField, setCopiedField] = useState<"name" | "value" | null>(
    null,
  );

  async function handleCopy(text: string, field: "name" | "value") {
    if (copiedField) return;
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  const colorClass =
    RECORD_COLORS[record.type.toUpperCase()] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground">
          {stepLabel.replace("{step}", String(step))}
        </span>
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold leading-tight ${colorClass}`}
        >
          {typeLabel.replace("{type}", record.type.toUpperCase())}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-sm">
        <span className="text-muted-foreground">{nameLabel}</span>
        <div className="flex items-center gap-1.5">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            {record.name}
          </code>
          <button
            type="button"
            onClick={() => handleCopy(record.name, "name")}
            className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            {copiedField === "name" ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
        <span className="text-muted-foreground">{valueLabel}</span>
        <div className="flex items-center gap-1.5">
          <code className="max-w-[240px] truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            {record.value}
          </code>
          <button
            type="button"
            onClick={() => handleCopy(record.value, "value")}
            className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            {copiedField === "value" ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
