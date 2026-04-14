import type { BlockProps } from '../../../config/types'

interface HeroConfig {
  ctaUrl?: string
  layout?: 'centered' | 'left-aligned'
}

function sanitizeCtaUrl(url?: string): string | undefined {
  if (!url) return undefined
  const isSafe = url.startsWith('/') || url.startsWith('https://')
  return isSafe ? url : undefined
}

export function HeroBlock({ config, t }: BlockProps) {
  const { ctaUrl, layout = 'centered' } = config as HeroConfig
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl)
  const isCenter = layout === 'centered'

  return (
    <section
      className={`flex flex-col gap-6 px-6 py-24 ${
        isCenter ? 'items-center text-center' : 'items-start text-left'
      }`}
    >
      {t.title && (
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl"
          style={{ color: 'hsl(var(--primary))' }}
        >
          {t.title}
        </h1>
      )}
      {t.subtitle && (
        <p className="text-lg text-zinc-600 max-w-2xl">{t.subtitle}</p>
      )}
      {t.ctaLabel && safeCtaUrl && (
        <a
          href={safeCtaUrl}
          className="inline-flex items-center px-6 py-3 rounded-md font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {t.ctaLabel}
        </a>
      )}
    </section>
  )
}
