import { db } from '@/5-shared/lib/db'
import { blocks } from '@/5-shared/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getBlocksByTenantId(tenantId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId))
    .orderBy(asc(blocks.order))
}
