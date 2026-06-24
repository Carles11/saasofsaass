import { BlogListPage, generateBlogListMetadata } from '@/1-pages/tenants/ui/blog'
import { getServerParams, Params, SearchParams } from '@/5-shared/lib/next/params.server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const context = await getServerParams(params, {})
  return generateBlogListMetadata(context)
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params
  searchParams?: SearchParams
}) {
  const context = await getServerParams(params, searchParams)
  return <BlogListPage context={context} />
}
