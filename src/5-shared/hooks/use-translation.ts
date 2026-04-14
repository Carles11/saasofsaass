import { useStore } from "@/5-shared/store";

function getNestedValue(obj: Record<string, any>, key: string): string | undefined {
  if (obj[key]) return obj[key];
  // Support dot notation for nested keys
  return key.split('.').reduce((acc, part) => (acc && acc[part] ? acc[part] : undefined), obj);
}

export function useTranslation() {
  const dictionary = useStore((state) => state.dictionary);
  function t(key: string): string {
    return getNestedValue(dictionary, key) ?? key;
  }
  return { t };
}
