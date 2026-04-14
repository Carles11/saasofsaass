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
  },
  hero: {
    component: HeroBlock,
    defaultConfig: { layout: 'centered', ctaUrl: '/' },
  },
  'blog-feed': {
    component: BlogFeedBlock as BlockComponent,
    defaultConfig: { maxItems: 9 },
  },
}
