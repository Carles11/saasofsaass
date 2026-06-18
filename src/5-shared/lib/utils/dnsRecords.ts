export interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

export interface ParsedDnsColumn {
  txt: string;
  records: DnsRecord[];
}

export function encodeDnsColumn(
  txt: string | null | undefined,
  records: DnsRecord[] | undefined,
): string | null {
  if (!txt && (!records || records.length === 0)) return null;
  return JSON.stringify({ txt: txt ?? "", records: records ?? [] });
}

const LEGACY_LINE = /^(\w+):\s+(.+?)\s+[—–-]\s+(.+)$/;

function parseLegacyRecords(txt: string): DnsRecord[] {
  return txt
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const m = line.match(LEGACY_LINE);
      if (!m) return null;
      const [, type, domain, reason] = m;
      const value = reason.startsWith("alias to ")
        ? reason.slice("alias to ".length)
        : domain;
      return { type, name: domain, value } as DnsRecord;
    })
    .filter((r): r is DnsRecord => r !== null);
}

export function parseDnsColumn(
  value: string | null | undefined,
): ParsedDnsColumn {
  if (!value) return { txt: "", records: [] };
  try {
    const parsed = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === "object" &&
      "txt" in parsed &&
      "records" in parsed
    ) {
      return parsed as ParsedDnsColumn;
    }
  } catch {}
  const records = parseLegacyRecords(value);
  return { txt: value, records };
}
