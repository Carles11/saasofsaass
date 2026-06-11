import { SiteBuilderPage } from '@/1-pages/dashboard/site-builder'
import type { SupportedLocaleType } from '@/5-shared/types'

interface Params {
  locale: string
  tenantId: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale, tenantId } = await params
  return <SiteBuilderPage tenantId={tenantId} locale={locale as SupportedLocaleType} />
}
