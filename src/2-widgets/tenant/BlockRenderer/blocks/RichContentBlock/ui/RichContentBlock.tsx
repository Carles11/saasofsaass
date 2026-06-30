import { RichTextRenderer } from "@/5-shared/ui/RichTextRenderer";
import type { BlockProps } from "../../../config/types";

/**
 * Rich-content block — a standalone formatted prose section.
 * HTML lives in the block's per-locale translations (`t.html`), produced by the
 * dashboard RichTextEditor and sanitized at render time.
 */
export function RichContentBlock({ t, blockId }: BlockProps) {
  const html = t.html;
  const heading = t.heading;
  if ((!html || !html.trim()) && !heading) return null;

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6">
      <div className="max-w-3xl mx-auto">
        {heading && (
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-8"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {heading}
          </h2>
        )}
        <RichTextRenderer html={html} />
      </div>
    </section>
  );
}
