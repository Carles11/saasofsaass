import type { BlockProps } from "../../../config/types";

export function MapBlock({ t, blockId, locale }: BlockProps) {
  const heading = t.heading;
  const address = t.address;

  if (!heading && !address) return null;

  const zoom = 14;
  const mapSrc = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=${zoom}`
    : null;

  return (
    <section id={blockId} className="py-16 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            address: { "@type": "PostalAddress", streetAddress: address },
          }),
        }}
      />
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl font-bold mb-10 text-center">{heading}</h2>
        )}
        {address && mapSrc && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="rounded-xs border border-border bg-card p-6">
              <address className="not-italic text-card-foreground whitespace-pre-line">
                {address}
              </address>
            </div>
            <div className="w-full">
              <iframe
                src={mapSrc}
                loading="lazy"
                allowFullScreen
                className="w-full aspect-video rounded-xs border-0"
                title={`Map showing ${address}`}
              />
            </div>
          </div>
        )}
        {address && !mapSrc && (
          <div className="rounded-xs border border-border bg-card p-6 max-w-lg mx-auto">
            <address className="not-italic text-card-foreground whitespace-pre-line">
              {address}
            </address>
          </div>
        )}
      </div>
    </section>
  );
}
