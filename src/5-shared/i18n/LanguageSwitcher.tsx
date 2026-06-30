"use client";

import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/5-shared/config/languages/supportedLanguages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

interface LanguageSwitcherProps {
  locales?: string[];
}

export function LanguageSwitcher({ locales: allowedLocales }: LanguageSwitcherProps) {
  const intlLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Derive the active locale from the URL — `useLocale()` can lag behind on
  // client-side navigation in the dashboard, leaving the trigger stuck.
  const segments = pathname.split("/");
  const urlLocale = segments[1];
  const pool = (allowedLocales ?? SUPPORTED_LOCALES) as readonly string[];
  const locale = pool.includes(urlLocale) ? urlLocale : intlLocale;

  const availableLocales = allowedLocales ?? SUPPORTED_LOCALES;

  function handleLocaleChange(newLocale: string) {
    const next = [...segments];
    next[1] = newLocale;
    router.push(next.join("/") || "/");
  }

  return (
    <Select key={locale} value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-8 w-fit gap-1.5 border-border/60 bg-transparent px-2 cursor-pointer">
        <Globe className="size-4" />
        <span className="text-xs font-semibold uppercase">{locale}</span>
      </SelectTrigger>
      <SelectContent position="popper" className="w-max">
        {availableLocales.map((l) => (
          <SelectItem
            key={l}
            value={l}
            className="text-xs w-full data-[state=checked]:rounded-none"
          >
            {LOCALE_LABELS[l] ?? l.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
