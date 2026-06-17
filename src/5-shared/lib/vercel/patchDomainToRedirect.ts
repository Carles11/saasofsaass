import {
  getVercelProjectDomain,
  updateVercelProjectDomain,
  type RemoveDomainResult,
} from "./vercel-domains";

/**
 * Ensure a www domain redirects to the given apex domain.
 *
 * If no redirect or a different redirect exists, updates it.
 * If the domain doesn't exist on the project yet, no-ops.
 */
export async function patchDomainToRedirect(
  domain: string,
  targetDomain: string,
  statusCode = 308,
): Promise<RemoveDomainResult> {
  const existing = await getVercelProjectDomain(domain);
  if (!existing) {
    return { status: "not_found" as const };
  }

  const currentRedirect = existing.redirect as string | null | undefined;

  if (
    currentRedirect &&
    normalizeForCompare(currentRedirect) === normalizeForCompare(targetDomain)
  ) {
    return { status: "deleted" as const };
  }

  await updateVercelProjectDomain(domain, {
    redirect: targetDomain,
    redirectStatusCode: statusCode,
  });

  return { status: "deleted" as const };
}

function normalizeForCompare(d: string): string {
  return d.trim().toLowerCase().replace(/\.$/, "");
}
