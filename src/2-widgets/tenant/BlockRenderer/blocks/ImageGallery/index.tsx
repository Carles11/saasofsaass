import type { GalleryImage } from "@/5-shared/types/tenants/blocks";
import Head from "next/head";
import Image from "next/image";

export interface ImageGalleryBlockProps {
  images: GalleryImage[];
  lang: string;
}

export function ImageGalleryBlock({ images, lang }: ImageGalleryBlockProps) {
  {
    images.map((img, idx) =>
      console.log(
        `Image ${idx}: meta=${JSON.stringify(img.meta)}, s3Key=${img.s3Key}, alt=${img.i18n[lang]?.alt}, caption=${img.i18n[lang]?.caption}`
      )
    );
  }

  return (
    <>
      <Head>
        {/* Open Graph tags */}
        {images[0] && (
          <>
            <meta property="og:image" content={`/api/image?key=${images[0].s3Key}`} />
            <meta property="og:image:alt" content={images[0].i18n[lang]?.alt} />
          </>
        )}
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageGallery",
              image: images.map((img) => ({
                "@type": "ImageObject",
                contentUrl: `/api/image?key=${img.s3Key}`,
                caption: img.i18n[lang]?.caption,
                description: img.i18n[lang]?.alt,
              })),
            }),
          }}
        />
      </Head>
      <div role="group" aria-label="Image gallery">
        {images.map((img, idx) => (
          <figure key={img.s3Key} aria-describedby={`caption-${img.s3Key}`}>
            <Image
              src={`/api/image?key=${img.s3Key}`}
              alt={img.i18n[lang]?.alt}
              width={img.meta.width}
              height={img.meta.height}
              loading="lazy"
              priority={idx === 0}
              style={{ objectFit: "cover" }}
              placeholder={img.meta.blurDataUrl ? "blur" : undefined}
              blurDataURL={img.meta.blurDataUrl}
            />
            <figcaption id={`caption-${img.s3Key}`}>{img.i18n[lang]?.caption}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
