export type TranslationDict = Record<string, string>;
export type TranslationParams = Record<string, string | number>;

export function formatTranslation(
  template: string,
  params?: TranslationParams,
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, token: string) => {
    const value = params[token];
    return value === undefined ? match : String(value);
  });
}

export function resolveTranslation(
  translations: TranslationDict | undefined,
  key: string,
  fallback: string,
  params?: TranslationParams,
): string {
  const source = translations?.[key] ?? fallback;
  return formatTranslation(source, params);
}
