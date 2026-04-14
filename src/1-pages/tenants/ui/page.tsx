import { notFound } from 'next/navigation'
import { getTenantByDomain } from '@/4-entities/tenant'
import { getBlocksByTenantId } from '@/4-entities/block'
import { BlockRenderer } from '@/2-widgets/tenant/BlockRenderer'
import { TenantPageProps } from '@/5-shared/types'

export async function TenantPage({ context }: TenantPageProps) {
  const { tenant, domain, locale, isSubdomain } = context

  const tenantData = await getTenantByDomain({ tenant, domain, isSubdomain })
  if (!tenantData) notFound()

  const tenantBlocks = await getBlocksByTenantId(tenantData.id)

  // Build CSS custom properties from tenant branding (e.g. { primary: '239 84% 67%' })
  const branding = (tenantData.branding ?? {}) as Record<string, string>
  const cssVars = Object.entries(branding)
    .map(([k, v]) => `--${k}: ${v}`)
    .join('; ')

  return (
    <>
      {cssVars && <style>{`:root { ${cssVars} }`}</style>}
      <main>
        <BlockRenderer blocks={tenantBlocks} locale={locale} tenant={tenantData} />
      </main>
    </>
  )
}