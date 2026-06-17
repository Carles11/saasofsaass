export const RESERVED_APEX = new Set(["admin", "www", "api", "mail", "smtp", "ftp", "app"]);

export function toApexDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.split("/")[0].split("?")[0].split("#")[0];
  d = d.replace(/\.$/, "");
  d = d.replace(/^www\./, "");
  return d;
}

export function toWwwDomain(apex: string): string {
  return `www.${apex}`;
}

export function isValidDomainFormat(domain: string): boolean {
  const apex = toApexDomain(domain);
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}$/.test(apex)) return false;
  const label = apex.split(".")[0];
  if (RESERVED_APEX.has(label)) return false;
  return true;
}
