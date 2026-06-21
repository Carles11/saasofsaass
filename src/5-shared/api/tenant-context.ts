import { getTenantByDomain } from "@/4-entities/tenant/api/getTenantByDomain";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { NextRequest } from "next/server";

/**
 * Resolves the tenant context from the incoming request.
 * Uses host header and (optionally) cookies or path for multi-tenant SaaS.
 */
export async function getTenantFromRequest(req: NextRequest) {
  const host = req.headers.get("host") || "";
  // Example: tenant1.example.com or www.example.com
  const [subdomain, ...domainParts] = host.split(".");
  const domain = domainParts.join(".");
  // You may want to refine this logic for your SaaS
  const isSubdomain = subdomain !== "www" && subdomain !== "app" && domainParts.length > 1;
  // Try to resolve tenant by subdomain or domain
  let tenant = await getTenantByDomain({
    tenant: subdomain,
    domain: host,
    isSubdomain,
  });

  // DEV fallback: if running on localhost and no tenant found, use the first tenant in DB
  if (!tenant && (/localhost/i.test(host) || /127\.0\.0\.1/.test(host))) {
    const [firstTenant] = await db.select().from(tenants).limit(1);
    if (firstTenant) {
      tenant = firstTenant;
    }
  }

  if (!tenant) return { tenant: null };
  return { tenant };
}
