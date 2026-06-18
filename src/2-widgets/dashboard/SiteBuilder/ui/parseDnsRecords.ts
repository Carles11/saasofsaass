import {
  parseDnsColumn,
  type DnsRecord,
} from "@/5-shared/lib/utils/dnsRecords";

export type { DnsRecord };

export function getDnsRecords(
  dnsInstructions: string | null | undefined,
): DnsRecord[] {
  const parsed = parseDnsColumn(dnsInstructions);
  return parsed.records;
}


