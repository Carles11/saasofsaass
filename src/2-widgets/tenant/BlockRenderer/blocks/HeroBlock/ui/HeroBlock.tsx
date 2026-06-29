import { getTemplate, HeroVariantId } from "@/5-shared/config/templates";
import type { BlockProps } from "../../../config/types";
import { CenteredOverlay } from "../variants/CenteredOverlay";
import { ClassicOverlay } from "../variants/ClassicOverlay";
import { MinimalText } from "../variants/MinimalText";
import { SplitImageRight } from "../variants/SplitImageRight";

const VARIANTS: Record<HeroVariantId, (props: BlockProps) => React.ReactNode> = {
  "centered-overlay": CenteredOverlay,
  "split-image-right": SplitImageRight,
  "classic-overlay": ClassicOverlay,
  "minimal-text": MinimalText,
};

export function HeroBlock(props: BlockProps) {
  const template = getTemplate(props.templateId);
  const Variant = VARIANTS[template.variants.hero];
  return <Variant {...props} />;
}
