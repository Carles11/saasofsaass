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

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleLocaleChange(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  }

  return (
    <Select defaultValue={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-8 w-fit gap-1 border-border/60 bg-transparent pe-1 cursor-pointer">
        <Globe className="size-4" />
      </SelectTrigger>
      <SelectContent position="popper" className="w-max">
        {SUPPORTED_LOCALES.map((l) => (
          <SelectItem key={l} value={l} className="text-xs w-full">
            {LOCALE_LABELS[l] ?? l.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
