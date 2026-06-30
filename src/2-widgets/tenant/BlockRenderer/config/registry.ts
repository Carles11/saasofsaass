import * as React from "react";
import { AwardsBlock } from "../blocks/AwardsBlock/ui/AwardsBlock";
import { BlogFeedBlock } from "../blocks/BlogFeedBlock/ui/BlogFeedBlock";
import { ContactBlock } from "../blocks/ContactBlock/ui/ContactBlock";
import { HeroBlock } from "../blocks/HeroBlock/ui/HeroBlock";
import { ImageGalleryBlock } from "../blocks/ImageGallery";
import { PodcastFeedBlock } from "../blocks/PodcastFeedBlock/ui/PodcastFeedBlock";
import { CtaBannerBlock } from "../blocks/CtaBannerBlock/ui/CtaBannerBlock";
import { CtaBannerImageBlock } from "../blocks/CtaBannerImageBlock/ui/CtaBannerImageBlock";
import { TextContentBlock } from "../blocks/TextContentBlock/ui/TextContentBlock";
import { RichContentBlock } from "../blocks/RichContentBlock/ui/RichContentBlock";
import { MapBlock } from "../blocks/MapBlock/ui/MapBlock";
import { FooterBlock } from "../blocks/FooterBlock/ui/FooterBlock";
import { TestimonialsBlock } from "../blocks/TestimonialsBlock/ui/TestimonialsBlock";
import { DonationsBlock } from "../blocks/DonationsBlock/ui/DonationsBlock";
import { SponsorsBlock } from "../blocks/SponsorsBlock/ui/SponsorsBlock";
import type { BlockComponent, BlockProps, BlockRegistry, BlockRegistryEntry } from "./types";
import { BLOCK_CATALOG } from "./blockCatalog";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";

const adaptImageGalleryBlock: BlockComponent = function AdaptImageGalleryBlock(props: BlockProps) {
  return React.createElement(ImageGalleryBlock, {
    images: (props.config.images ?? []) as import("@/5-shared/types/tenants/blocks").GalleryImage[],
    lang: (props.config.lang as string) ?? props.locale,
    galleryName: props.config.galleryName as string | undefined,
    blockId: props.block.id,
  });
};

const COMPONENTS: Record<BlockKind, BlockComponent> = {
  hero: HeroBlock,
  "blog-feed": BlogFeedBlock,
  "podcast-feed": PodcastFeedBlock,
  awards: AwardsBlock,
  contact: ContactBlock,
  "cta-banner": CtaBannerBlock,
  "cta-banner-image": CtaBannerImageBlock,
  "text-content": TextContentBlock,
  "rich-content": RichContentBlock,
  "image-gallery": adaptImageGalleryBlock,
  map: MapBlock,
  footer: FooterBlock,
  testimonials: TestimonialsBlock,
  donations: DonationsBlock,
  sponsors: SponsorsBlock,
};

function buildEntry(kind: BlockKind, component: BlockComponent): BlockRegistryEntry {
  return {
    component,
    includeInNav: BLOCK_CATALOG[kind].includeInNav,
    navLabel: BLOCK_CATALOG[kind].navLabel,
    archivePath: BLOCK_CATALOG[kind].archivePath,
    defaultConfig: BLOCK_CATALOG[kind].defaultConfig,
    fields: BLOCK_CATALOG[kind].fields,
  };
}

export const blockRegistry: BlockRegistry = {
  hero: buildEntry("hero", HeroBlock),
  "blog-feed": buildEntry("blog-feed", BlogFeedBlock),
  "podcast-feed": buildEntry("podcast-feed", PodcastFeedBlock),
  awards: buildEntry("awards", AwardsBlock),
  contact: buildEntry("contact", ContactBlock),
  "cta-banner": buildEntry("cta-banner", CtaBannerBlock),
  "cta-banner-image": buildEntry("cta-banner-image", CtaBannerImageBlock),
  "text-content": buildEntry("text-content", TextContentBlock),
  "rich-content": buildEntry("rich-content", RichContentBlock),
  "image-gallery": buildEntry("image-gallery", adaptImageGalleryBlock),
  map: buildEntry("map", MapBlock),
  footer: buildEntry("footer", FooterBlock),
  testimonials: buildEntry("testimonials", TestimonialsBlock),
  donations: buildEntry("donations", DonationsBlock),
  sponsors: buildEntry("sponsors", SponsorsBlock),
};
