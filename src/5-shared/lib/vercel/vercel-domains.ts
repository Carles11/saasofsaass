// ── Vercel Project Domains API wrapper ────────────────────────────────────────
// Docs: https://vercel.com/docs/rest-api/endpoints/projects#list-project-domains

import { toApexDomain, toWwwDomain } from "@/5-shared/lib/utils/domain";

const VERCEL_API = "https://api.vercel.com";

// Lazily-cached server-only config — validated on first call, never re-reads env
let _vercelConfig: { token: string; projectId: string } | null = null;

function getVercelConfig(): { token: string; projectId: string } {
  if (_vercelConfig) return _vercelConfig;
  const token = process.env.VERCEL_TOKEN_SOSS;
  const projectId = process.env.VERCEL_PROJECT_ID_SOSS;
  if (!token) throw new Error("VERCEL_TOKEN_SOSS is not configured");
  if (!projectId) throw new Error("VERCEL_PROJECT_ID_SOSS is not configured");
  _vercelConfig = { token, projectId };
  return _vercelConfig;
}

function normalizeDomain(input: string): string {
  return input.trim().toLowerCase();
}

async function vercelFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { token } = getVercelConfig();
  const url = `${VERCEL_API}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
}

// ── Public domain verification status helpers ──────────────────────────────────

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

export interface AddDomainResult {
  status: "added" | "already_exists" | "error";
  error?: string;
  dnsInstructions?: string;
  dnsRecords?: DnsRecord[];
}

export interface RemoveDomainResult {
  status: "deleted" | "not_found" | "error";
  error?: string;
}

export interface DomainStatusResult {
  status: "valid" | "pending_validation" | "pending_certificate" | "error";
  error?: string;
  dnsInstructions?: string;
  dnsRecords?: DnsRecord[];
}

// ── API methods ────────────────────────────────────────────────────────────────

export async function addDomainToVercelProject(
  domain: string,
  options?: { redirect?: string; redirectStatusCode?: number },
): Promise<AddDomainResult> {
  const { projectId } = getVercelConfig();
  const name = normalizeDomain(domain);

  try {
    const body: Record<string, unknown> = { name };
    if (options?.redirect) body.redirect = normalizeDomain(options.redirect);
    if (options?.redirectStatusCode) body.redirectStatusCode = options.redirectStatusCode;

    const res = await vercelFetch(`/v10/projects/${projectId}/domains`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const body = await res.json().catch<Record<string, unknown>>(() => ({}));
      const verification = body.verification as
        | Array<{ type: string; domain: string; value: string; reason: string }>
        | undefined;
      const dnsInstructions = verification
        ?.map((v) => `${v.type}: ${v.domain} — ${v.reason}`)
        .join("\n");
      const dnsRecords = verification?.map((v) => ({
        type: v.type,
        name: v.domain === name ? "@" : v.domain.slice(0, -(name.length + 1)),
        value: v.value,
      }));
      return { status: "added", dnsInstructions, dnsRecords };
    }

    const data = await res.json().catch(() => ({}));
    const errMsg = data?.error?.message ?? data?.message ?? `HTTP ${res.status}`;

    // 409 — already exists on this project
    if (res.status === 409) {
      // If a redirect was requested but the domain already exists without one,
      // the caller should handle this via patchDomainToRedirect.
      return { status: "already_exists", error: errMsg };
    }

    return { status: "error", error: mapVercelErrorMessage(errMsg) };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  }
}

export async function removeDomainFromVercelProject(
  domain: string,
): Promise<RemoveDomainResult> {
  const { projectId } = getVercelConfig();
  const name = normalizeDomain(domain);

  try {
    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`,
      { method: "DELETE" },
    );

    if (res.ok) return { status: "deleted" };

    if (res.status === 404) return { status: "not_found" };

    const data = await res.json().catch(() => ({}));
    return {
      status: "error",
      error: data?.error?.message ?? `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  }
}

export async function getVercelProjectDomain(
  domain: string,
): Promise<Record<string, unknown> | null> {
  const { projectId } = getVercelConfig();
  const name = normalizeDomain(domain);

  try {
    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`,
    );

    if (res.status === 404) return null;
    if (!res.ok) return null;

    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function updateVercelProjectDomain(
  domain: string,
  opts: { redirect?: string; redirectStatusCode?: number },
): Promise<{ status: "updated" | "error"; error?: string }> {
  const { projectId } = getVercelConfig();
  const name = normalizeDomain(domain);

  try {
    const body: Record<string, unknown> = {};
    if (opts.redirect !== undefined) body.redirect = normalizeDomain(opts.redirect);
    if (opts.redirectStatusCode !== undefined) body.redirectStatusCode = opts.redirectStatusCode;

    const res = await vercelFetch(
      `/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    if (res.ok) return { status: "updated" };

    const data = await res.json().catch(() => ({}));
    return {
      status: "error",
      error: data?.error?.message ?? `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  }
}

interface VercelVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

/** Merge verification records from both apex and www queries, deduplicate by type+domain. */
function mergeVerification(
  ...sources: (VercelVerification[] | undefined)[]
): VercelVerification[] {
  const seen = new Set<string>();
  const result: VercelVerification[] = [];
  for (const arr of sources) {
    if (!arr) continue;
    for (const v of arr) {
      const key = `${v.type}:${v.domain}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(v);
      }
    }
  }
  return result;
}

/**
 * Synthesise standard Vercel DNS records when the API doesn't return
 * explicit verification instructions (common for pending_certificate / verified states).
 */
function synthesizeDnsRecords(
  apex: string,
  www: string,
): { dnsInstructions: string; dnsRecords: DnsRecord[] } {
  const dnsInstructions = [
    `A: ${apex} — alias to 76.76.21.21`,
    `CNAME: ${www} — alias to cname.vercel-dns.com`,
  ].join("\n");

  const dnsRecords: DnsRecord[] = [
    { type: "A", name: "@", value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
  ];

  return { dnsInstructions, dnsRecords };
}

/**
 * Convert Vercel verification entries into our DnsRecord format.
 * Uses the apex as the base for computing record names (e.g. "@" for apex, "www" for www).
 */
function verificationToRecords(
  verification: VercelVerification[],
  apex: string,
): { dnsInstructions: string; dnsRecords: DnsRecord[] } {
  const dnsInstructions = verification
    .map((v) => `${v.type}: ${v.domain} — ${v.reason}`)
    .join("\n");

  const dnsRecords: DnsRecord[] = verification.map((v) => ({
    type: v.type,
    name: v.domain === apex ? "@" : v.domain.slice(0, -(apex.length + 1)),
    value: v.value,
  }));

  return { dnsInstructions, dnsRecords };
}

/**
 * Two-phase Vercel domain status check:
 * 1. Query BOTH the apex and www subdomain for DNS verification records.
 * 2. If verified, also check `/v6/domains/{domain}/config` to confirm DNS points to Vercel.
 * 3. Always returns combined DNS instructions — falls back to standard values when the API omits them.
 */
export async function getVercelDomainStatus(
  domain: string,
): Promise<DomainStatusResult> {
  const name = normalizeDomain(domain);
  const apex = toApexDomain(name);
  const www = toWwwDomain(apex);

  try {
    const domainRecord = await getVercelProjectDomain(name);
    if (!domainRecord) {
      return { status: "error", error: "Domain not found on Vercel project." };
    }

    // Query www subdomain for its verification records (414 ok if not added)
    const wwwRecord =
      www !== name ? await getVercelProjectDomain(www) : null;

    const apexVerification = domainRecord.verification as
      | VercelVerification[]
      | undefined;
    const wwwVerification = wwwRecord?.verification as
      | VercelVerification[]
      | undefined;

    // Merge verification from both queries, deduplicated
    const verification = mergeVerification(
      apexVerification,
      wwwVerification,
    );

    // Convert to our format — or use fallback if Vercel returned nothing
    const { dnsInstructions, dnsRecords } =
      verification.length > 0
        ? verificationToRecords(verification, apex)
        : synthesizeDnsRecords(apex, www);

    const verified = domainRecord.verified === true;

    if (!verified) {
      return {
        status: "pending_validation",
        dnsInstructions,
        dnsRecords,
      };
    }

    // Phase 2: DNS config check
    const { token } = getVercelConfig();
    const configRes = await fetch(
      `${VERCEL_API}/v6/domains/${encodeURIComponent(name)}/config`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!configRes.ok) {
      return {
        status: "pending_validation",
        dnsInstructions,
        error: "DNS configuration not fully propagated.",
        dnsRecords,
      };
    }

    const config = await configRes.json().catch(() => ({}));
    const misconfigured =
      (config as Record<string, unknown>)?.misconfigured === true;

    if (misconfigured) {
      return {
        status: "pending_validation",
        dnsInstructions,
        dnsRecords,
      };
    }

    // Verified, DNS is correct, and Vercel can issue TLS — domain is fully valid.
    // Note: there is no separate certificate-ready field in either Vercel API
    // endpoint (GET /v9/projects/.../domains/:domain has no `ready` field, and
    // GET /v6/domains/:domain/config returns misconfigured which already covers
    // whether TLS can be auto-issued).
    return { status: "valid", dnsInstructions, dnsRecords };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to check domain status",
    };
  }
}

// ── Error message mapping ─────────────────────────────────────────────────────

export function mapVercelErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes("caa record"))
    return "CAA record prevents certificate issuance. Add a CAA record allowing Vercel.";
  if (lower.includes("already in use") || lower.includes("already taken"))
    return "This domain is already connected to another Vercel project.";
  if (lower.includes("rate limit"))
    return "Vercel API rate limit reached. Please wait a moment and try again.";
  if (lower.includes("invalid name") || lower.includes("invalid domain"))
    return "Invalid domain format. Enter a valid domain like example.com.";
  if (lower.includes("not verified"))
    return "Domain ownership verification required. Check your DNS provider.";

  return raw;
}
