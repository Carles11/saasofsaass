import { getTenantByDomain } from "@/4-entities/tenant";
import { StoreHydrator } from "@/5-shared/store/StoreHydrator";
import { TenantHeader } from "@/2-widgets/tenant/header/tenantHeader";

export default async function TenantLayout({
  params,
  children,
}: {
  params: Promise<{ domain: string }>;
  children: React.ReactNode;
}) {
  const { domain } = await params;

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";
  const isSubdomain =
    (domain.endsWith(`.${rootDomain}`) && domain !== rootDomain) ||
    /^[a-z0-9][a-z0-9-]*\.localhost$/.test(domain) ||
    domain.endsWith(".lvh.me");
  const tenantKey = isSubdomain ? domain.split(".")[0] : domain;

  const tenant = await getTenantByDomain({
    tenant: tenantKey,
    domain,
    isSubdomain,
  });

  return (
    <StoreHydrator tenant={tenant ?? null}>
      {tenant && <TenantHeader />}
      <div className="min-h-screen selection:bg-zinc-900 selection:text-white">{children}</div>
    </StoreHydrator>
  );
}
