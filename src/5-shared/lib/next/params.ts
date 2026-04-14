import { SUPPORTED_LOCALES } from '@/5-shared/config';
import { PageContextTypes, SupportedLocaleType } from '@/5-shared/types';
import { useParams } from 'next/navigation'

// FSD utility for resolving Next.js server params (params, searchParams)
// Supports both direct objects and Promises (Next.js 15+)

export type Params = Record<string, string> | Promise<Record<string, string>>;
export type SearchParams = Record<string, string | string[]> | Promise<Record<string, string | string[]>>;

/**
 * 1. SERVER HELPER: getServerParams
 * Used in Server Components (e.g., app/[domain]/page.tsx)
 */
export async function getServerParams(
  paramsPromise: Params,
  searchParamsPromise: SearchParams = {}
): Promise<PageContextTypes> {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const domain = params.domain || 'localhost:3000';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saasofsaass.com';
  
  const isSubdomain = domain.endsWith(rootDomain) && domain !== rootDomain;
  const tenant = isSubdomain ? domain.split('.')[0] : domain;

  // Locale Resolution Logic
  const defaultLocale: SupportedLocaleType = 'es';
  const rawLocale = (params.locale || searchParams.lang || defaultLocale) as string;
  
  const supportedLocales: SupportedLocaleType[] = SUPPORTED_LOCALES
  const locale = supportedLocales.includes(rawLocale as SupportedLocaleType) 
    ? (rawLocale as SupportedLocaleType) 
    : defaultLocale;

  return { domain, tenant, locale, isSubdomain };
}

/**
 * 2. CLIENT HELPER: useClientParams
 * A hook for Client Components (e.g., DonateButton)
 */
export function useClientParams() {
  const params = useParams();
  
  // Cast safely
  const domain = (params?.domain as string) || 'localhost:3000';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saasofsaass.com';
  
  const isSubdomain = domain.endsWith(rootDomain) && domain !== rootDomain;
  const tenant = isSubdomain ? domain.split('.')[0] : domain;

  return {
    domain,
    tenant,
    isSubdomain,
    // Note: searchParams for locale in client components usually 
    // requires useSearchParams() which we can add if needed.
  };
}