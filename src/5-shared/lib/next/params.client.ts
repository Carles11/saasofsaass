'use client'
import { SupportedLocaleType } from '@/5-shared/types'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'

export function useClientParams() {
  const params = useParams()
  const locale = useLocale() as SupportedLocaleType

  const domain = (params?.domain as string) || 'localhost'
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saasofsaass.com'

  const isSubdomain = domain.endsWith(rootDomain) && domain !== rootDomain
  const tenant = isSubdomain ? domain.split('.')[0] : domain

  return { domain, tenant, locale, isSubdomain }
}