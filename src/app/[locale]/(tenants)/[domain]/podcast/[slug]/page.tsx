import { PodcastDetailPage, generatePodcastDetailMetadata } from '@/1-pages/tenants/ui/podcast'
import { getServerParams, Params, SearchParams } from '@/5-shared/lib/next/params.server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>
}): Promise<Metadata> {
  const { domain, slug } = await params
  const context = await getServerParams({ domain }, {})
  return generatePodcastDetailMetadata({ context, slug })
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; slug: string }>
  searchParams?: SearchParams
}) {
  const { domain, slug } = await params
  const context = await getServerParams({ domain }, searchParams)
  return <PodcastDetailPage context={context} slug={slug} />
}
