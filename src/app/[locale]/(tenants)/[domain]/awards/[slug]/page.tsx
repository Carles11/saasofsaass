import { AwardsDetailPage, generateAwardsDetailMetadata } from "@/1-pages/tenants/ui/awards";
import { getServerParams, SearchParams } from "@/5-shared/lib/next/params.server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const context = await getServerParams({ domain }, {});
  return generateAwardsDetailMetadata({ context, slug });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; slug: string }>;
  searchParams?: SearchParams;
}) {
  const { domain, slug } = await params;
  const context = await getServerParams({ domain }, searchParams);
  return <AwardsDetailPage context={context} slug={slug} />;
}
