'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SupportedLocaleType } from '@/5-shared/types'

interface LanguageSelectorProps {
  locales: string[]
  activeLocale: SupportedLocaleType
  onChange: (locale: SupportedLocaleType) => void
  disabled?: boolean
}

export function LanguageSelector({ locales, activeLocale, onChange, disabled }: LanguageSelectorProps) {
  return (
    <Tabs value={activeLocale} onValueChange={v => onChange(v as SupportedLocaleType)}>
      <TabsList className={disabled ? 'pointer-events-none opacity-60' : ''}>
        {locales.map(locale => (
          <TabsTrigger key={locale} value={locale} className="uppercase text-xs font-bold px-3">
            {locale}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
