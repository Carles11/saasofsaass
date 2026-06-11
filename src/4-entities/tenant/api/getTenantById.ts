import { db } from '@/5-shared/lib/db'
import { tenants } from '@/5-shared/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getTenantById(id: string) {
  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1)

  return result[0] ?? null
}
