import type { BlockProps } from "../../../config/types";

export function TextContentBlock({ t, blockId }: BlockProps) {
  const heading = t.heading;
  const body = t.body;

  if (!heading && !body) return null;

  const paragraphs = body ? body.split(/\n\n+/).filter(Boolean) : [];

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-12 lg:gap-16">
        {heading && (
          <div className="lg:col-span-5">
            <span
              aria-hidden
              className="block h-1 w-12 rounded-full bg-primary mb-6"
            />
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h2>
          </div>
        )}
        {paragraphs.length > 0 && (
          <div
            className="lg:col-span-7 flex flex-col gap-5"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-xl text-foreground leading-relaxed"
                    : "text-base text-muted-foreground leading-relaxed"
                }
              >
                {paragraph.split("\n").map((line, j) =>
                  j === 0 ? line : (
                    <span key={j}>
                      <br />
                      {line}
                    </span>
                  ),
                )}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
