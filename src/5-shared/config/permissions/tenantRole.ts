import type { TenantRole } from "./types"

/**
 * Site-level role hierarchy. Higher rank includes every capability of the
 * ranks below it: owner ⊃ webmaster ⊃ editor.
 *
 * - editor    → content only (block text/translations, entities, content images)
 * - webmaster → full control on an assigned site (blocks, languages, publish,
 *               domains, invite editors) — everything an owner can do on a site,
 *               minus account/billing/workspace concerns
 * - owner     → workspace owner; top of the hierarchy on every site they own
 *
 * Pure + client-safe (no DB imports) so both the server authorization helpers
 * and client builder UI can share one source of truth.
 */
export const TENANT_ROLE_RANK: Record<TenantRole, number> = {
  editor: 1,
  webmaster: 2,
  owner: 3,
}

/** Can manage a site's structure (blocks, settings, domains, publish, reorder). */
export function canManageStructure(role: TenantRole | null | undefined): boolean {
  return role === "owner" || role === "webmaster"
}

/** Can edit a site's content (any non-null tenant role). */
export function canEditContent(role: TenantRole | null | undefined): boolean {
  return role === "owner" || role === "webmaster" || role === "editor"
}
