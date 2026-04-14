import type { BlockProps } from '../../../config/types'

interface NavbarConfig {
  links?: Array<{ label: string; href: string }>
}

function sanitizeHref(href: string): string {
  const isSafe = href.startsWith('/') || href.startsWith('https://')
  return isSafe ? href : '#'
}

export function NavbarBlock({ config, t, tenant }: BlockProps) {
  const { links = [] } = config as NavbarConfig
  const siteTitle = t.siteTitle ?? tenant.name

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
      <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>
        {siteTitle}
      </span>
      {links.length > 0 && (
        <ul className="hidden sm:flex items-center gap-6">
          {links.map((link, i) => (
            <li key={i}>
              <a
                href={sanitizeHref(link.href)}
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
