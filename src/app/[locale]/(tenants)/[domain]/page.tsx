import { TenantPage } from "@/1-pages/tenants";
import { getServerParams, Params, SearchParams } from "@/5-shared/lib/next/params.server";

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const context = await getServerParams(params, searchParams);
  return <TenantPage context={context} />;
}
