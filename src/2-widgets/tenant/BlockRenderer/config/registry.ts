import * as React from "react";
import { BlogFeedBlock } from "../blocks/BlogFeedBlock/ui/BlogFeedBlock";
import { HeroBlock } from "../blocks/HeroBlock/ui/HeroBlock";
import { ImageGalleryBlock } from "../blocks/ImageGallery";
import { NavbarBlock } from "../blocks/NavbarBlock/ui/NavbarBlock";
import type { BlockComponent, BlockProps, BlockRegistry } from "./types";

const adaptImageGalleryBlock: BlockComponent = function AdaptImageGalleryBlock(props: BlockProps) {
  return React.createElement(ImageGalleryBlock, {
    images: props.config.images ?? [],
    lang: props.config.lang ?? props.locale,
  });
};

export const blockRegistry: BlockRegistry = {
  navbar: {
    component: NavbarBlock,
    defaultConfig: { links: [] },
    fields: [{ key: "siteTitle", label: "Site Title", inputType: "input" }],
  },
  hero: {
    component: HeroBlock,
    defaultConfig: { layout: "centered", ctaUrl: "/" },
    fields: [
      { key: "title", label: "Title", inputType: "input" },
      { key: "subtitle", label: "Subtitle", inputType: "textarea" },
      { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
    ],
  },
  "blog-feed": {
    component: BlogFeedBlock,
    defaultConfig: { maxItems: 9 },
    fields: [], // collection blocks — managed via CollectionManager tab
  },
  "image-gallery": {
    component: adaptImageGalleryBlock,
    defaultConfig: {
      images: [], // Will be managed via a gallery manager/editor
      lang: "en",
    },
    fields: [
      { key: "images", label: "Images", inputType: "input" }, // Placeholder, real editing via gallery UI
      { key: "lang", label: "Language", inputType: "input" },
    ],
  },
};
