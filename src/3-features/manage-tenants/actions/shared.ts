export const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,61})[a-z0-9]$/;

export interface CreateTenantInput {
  name: string;
  slug: string;
  defaultLocale?: string;
}
