import type { BlockProps } from "../../../config/types";

export function TextContentBlock({ t }: BlockProps) {
  const heading = t.heading;
  const body = t.body;

  if (!heading && !body) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {heading && (
          <h2 className="text-3xl font-bold mb-6">{heading}</h2>
        )}
        {body && renderParagraphs(body)}
      </div>
    </section>
  );
}

function renderParagraphs(text: string) {
  return text.split(/\n\n+/).filter(Boolean).map((paragraph, i) => (
    <p key={i} className="mb-4 last:mb-0 leading-relaxed">
      {paragraph.split("\n").map((line, j) =>
        j === 0 ? line : <><br />{line}</>
      )}
    </p>
  ));
}
