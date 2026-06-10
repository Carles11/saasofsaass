import { db } from "./index";
import { platformTranslations } from "./schema";
import { and, eq, inArray } from "drizzle-orm";
import {
  formatTranslation,
  resolveTranslation,
  type TranslationDict,
  type TranslationParams,
} from "@/5-shared/lib/translations/resolve";

export type NamespacedTranslations = Record<string, TranslationDict>;
export type { TranslationDict, TranslationParams };

export async function getPlatformTranslations(
  namespace: string,
  locale: string,
): Promise<TranslationDict> {
  const rows = await db
    .select({ key: platformTranslations.key, value: platformTranslations.value })
    .from(platformTranslations)
    .where(
      and(
        eq(platformTranslations.namespace, namespace),
        eq(platformTranslations.locale, locale),
      ),
    );

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getPlatformTranslationsByNamespaces(
  namespaces: string[],
  locale: string,
): Promise<NamespacedTranslations> {
  const uniqueNamespaces = [...new Set(namespaces)].filter(Boolean);

  if (uniqueNamespaces.length === 0) {
    return {};
  }

  const rows = await db
    .select({
      namespace: platformTranslations.namespace,
      key: platformTranslations.key,
      value: platformTranslations.value,
    })
    .from(platformTranslations)
    .where(
      and(
        inArray(platformTranslations.namespace, uniqueNamespaces),
        eq(platformTranslations.locale, locale),
      ),
    );

  const result: NamespacedTranslations = {};

  for (const row of rows) {
    if (!result[row.namespace]) {
      result[row.namespace] = {};
    }
    result[row.namespace][row.key] = row.value;
  }

  return result;
}

export { formatTranslation, resolveTranslation };

export function resolveNamespacedTranslation(
  dictionaries: NamespacedTranslations | undefined,
  namespace: string,
  key: string,
  fallback: string,
  params?: TranslationParams,
): string {
  return resolveTranslation(dictionaries?.[namespace], key, fallback, params);
}
