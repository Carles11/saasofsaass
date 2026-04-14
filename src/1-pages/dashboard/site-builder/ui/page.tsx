import { notFound } from 'next/navigation'
import { getTenantById } from '@/4-entities/tenant'
import { getBlocksByTenantId } from '@/4-entities/block'
import { getEntitiesByTenant } from '@/4-entities/tenant-content'
import { SiteBuilder } from '@/2-widgets/dashboard/SiteBuilder'
import type { SupportedLocaleType } from '@/5-shared/types'

interface SiteBuilderPageProps {
  tenantId: string
  locale: SupportedLocaleType
}

export async function SiteBuilderPage({ tenantId, locale }: SiteBuilderPageProps) {
  const tenant = await getTenantById(tenantId)
  if (!tenant) notFound()

  const [blocks, entities] = await Promise.all([
    getBlocksByTenantId(tenant.id),
    getEntitiesByTenant({ tenantId: tenant.id, locale }),
  ])

  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <SiteBuilder
          tenant={tenant}
          blocks={blocks}
          initialEntities={entities}
        />
      </div>
    </main>
  )
}
