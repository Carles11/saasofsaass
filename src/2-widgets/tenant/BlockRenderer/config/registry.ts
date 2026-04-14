export { resolveBlockT } from './types'
export type {
  BlockProps,
  BlockComponent,
  BlockRegistryEntry,
  BlockRegistry,
} from './types'

import type { BlockRegistry, BlockComponent } from './types'
import { NavbarBlock } from '../blocks/NavbarBlock/ui/NavbarBlock'
import { HeroBlock } from '../blocks/HeroBlock/ui/HeroBlock'
import { BlogFeedBlock } from '../blocks/BlogFeedBlock/ui/BlogFeedBlock'

export const blockRegistry: BlockRegistry = {
  navbar: {
    component: NavbarBlock,
    defaultConfig: { links: [] },
    fields: [
      { key: 'siteTitle', label: 'Site Title', inputType: 'input' },
    ],
  },
  hero: {
    component: HeroBlock,
    defaultConfig: { layout: 'centered', ctaUrl: '/' },
    fields: [
      { key: 'title',    label: 'Title',            inputType: 'input' },
      { key: 'subtitle', label: 'Subtitle',          inputType: 'textarea' },
      { key: 'ctaLabel', label: 'CTA Button Label',  inputType: 'input' },
    ],
  },
  'blog-feed': {
    component: BlogFeedBlock as BlockComponent,
    defaultConfig: { maxItems: 9 },
    fields: [], // collection blocks — managed via CollectionManager tab
  },
}
