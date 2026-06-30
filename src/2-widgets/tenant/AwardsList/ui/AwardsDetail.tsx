import type { SupportedLocaleType } from "@/5-shared/types";
import type { Tenant } from "@/5-shared/lib/db/schema";
import type {
  AwardItemEntity,
  AwardItemPayload,
  EntityWithTranslation,
} from "@/5-shared/types/tenants/entities";
import { RichTextRenderer } from "@/5-shared/ui/RichTextRenderer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type AwardRow = EntityWithTranslation<AwardItemEntity, AwardItemPayload>;

interface AwardsDetailProps {
  data: AwardRow;
  locale: SupportedLocaleType;
  tenant: Tenant;
  backLabel?: string;
}

export function AwardsDetail({ data, locale, backLabel }: AwardsDetailProps) {
  const { entity, translation } = data;
  const payload = translation?.payload ?? ({} as AwardItemPayload);
  const title = payload.title ?? entity.slug ?? entity.id;
  const description = payload.description;
  const isHtml = !!description && /<[a-z][\s\S]*>/i.test(description);

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${locale}/awards`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? "Back"}
        </Link>

        {entity.coverImageUrl && (
          <div className="mb-8 flex justify-center overflow-hidden rounded-[var(--radius)] bg-muted/40">
            {/* Full image — fills width when landscape, caps height when portrait */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entity.coverImageUrl}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        )}

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h1>

        {description &&
          (isHtml ? (
            <RichTextRenderer html={description} />
          ) : (
            <div className="max-w-none leading-relaxed text-foreground [&_p]:mb-4">
              {description.split("\n").map((p, i) => (p.trim() ? <p key={i}>{p}</p> : null))}
            </div>
          ))}
      </div>
    </article>
  );
}
