import type { SupportedLocaleType } from "@/5-shared/types";
import type { Tenant } from "@/5-shared/lib/db/schema";
import type {
  EntityWithTranslation,
  PodcastEntity,
  PodcastEpisodePayload,
} from "@/5-shared/types/tenants/entities";
import { parseMediaUrl } from "@/5-shared/lib/media/media-url";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

type PodcastRow = EntityWithTranslation<PodcastEntity, PodcastEpisodePayload>;

interface PodcastDetailProps {
  data: PodcastRow;
  locale: SupportedLocaleType;
  tenant: Tenant;
  backLabel?: string;
  listenLabel?: string;
}

function formatDate(date: Date | string, locale: SupportedLocaleType) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export function PodcastDetail({ data, locale, backLabel, listenLabel }: PodcastDetailProps) {
  const { entity, translation } = data;
  const payload = translation?.payload ?? ({} as PodcastEpisodePayload);
  const title = payload.title ?? entity.slug ?? entity.id;
  const meta = entity.metadata as PodcastEntity["metadata"] | null;
  const media = parseMediaUrl(meta?.url);

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${locale}/podcast`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? "Back"}
        </Link>

        {/* Media player: video embed, audio player, or external link + poster */}
        {media && (media.kind === "youtube" || media.kind === "vimeo") ? (
          <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-[var(--radius)] bg-black">
            <iframe
              src={media.embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <>
            {entity.coverImageUrl && (
              <div className="relative w-full aspect-[2/1] mb-6 overflow-hidden rounded-[var(--radius)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entity.coverImageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}
            {media?.kind === "audio" && (
              <audio controls src={media.url} className="w-full mb-6">
                {listenLabel ?? "Listen"}
              </audio>
            )}
          </>
        )}

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          {entity.publishedAt && (
            <time dateTime={entity.publishedAt.toISOString()}>
              {formatDate(entity.publishedAt, locale)}
            </time>
          )}
        </div>

        {payload.description && (
          <p className="text-base text-foreground leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
            {payload.description}
          </p>
        )}

        {media?.kind === "external" && (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="h-4 w-4" />
            {listenLabel ?? "Listen"}
          </a>
        )}
      </div>
    </article>
  );
}
