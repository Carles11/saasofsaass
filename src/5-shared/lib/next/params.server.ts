import { PageContextTypes, SupportedLocaleType } from '@/5-shared/types'
import { getLocale } from 'next-intl/server'

export type Params = Record<string, string> | Promise<Record<string, string>>
export type SearchParams = Record<string, string | string[]> | Promise<Record<string, string | string[]>>

export async function getServerParams(
  paramsPromise: Params,
  searchParamsPromise: SearchParams = {}
): Promise<PageContextTypes & { searchParams: Record<string, string | string[]> }> {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise

  const domain = params.domain || 'localhost'
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saasofsaass.com'

  // Mirror the same subdomain detection logic as domain-parser.ts:
  // a) production:  <slug>.saasofsaass.com
  // b) dev:         <slug>.localhost
  const isSubdomain =
    (domain.endsWith(`.${rootDomain}`) && domain !== rootDomain) ||
    /^[a-z0-9][a-z0-9-]*\.localhost$/.test(domain)

  const tenant = isSubdomain ? domain.split('.')[0] : domain
  const locale = (await getLocale()) as SupportedLocaleType

  return { domain, tenant, locale, isSubdomain, searchParams }
}