import type { DnsRecord } from "./parseDnsRecords";

export function buildDelegateEmailLink(
  domain: string,
  records: DnsRecord[],
  subject: string,
  bodyTemplate: string,
): string {
  const recordsText =
    records.length > 0
      ? records
          .map((r) => `${r.type.toUpperCase()} ${r.name} → ${r.value}`)
          .join("\n")
      : "Please check the domain settings in your SoSS dashboard for setup instructions.";

  const body = bodyTemplate
    .replace(/\{domain\}/g, domain)
    .replace(/\{records\}/g, recordsText);

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
