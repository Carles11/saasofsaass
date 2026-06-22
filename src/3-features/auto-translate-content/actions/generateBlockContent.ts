"use server";

import { db } from "@/5-shared/lib/db";
import { blocks, tenantEntities, tenants, tenantTranslations } from "@/5-shared/lib/db/schema";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { and, eq } from "drizzle-orm";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";

// Block types that have translatable text fields (non-image fields)
const BLOCK_TYPES_WITH_TRANSLATIONS: Set<BlockKind> = new Set([
  "navbar",
  "hero",
  "contact",
  "text-content",
]);

function titleize(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function generateBlockPlaceholder(blockType: BlockKind): Record<string, string> {
  switch (blockType) {
    case "hero":
      return {
        title: "Welcome",
        subtitle: "Your tagline goes here",
        ctaLabel: "Get Started",
      };
    case "navbar":
      return { siteTitle: "My Site" };
    case "contact":
      return {
        title: "Contact Us",
        description: "We'd love to hear from you. Get in touch.",
      };
    default:
      return {};
  }
}

function generateEntityPlaceholder(kind: string, slug: string): Record<string, string> {
  const title = titleize(slug);
  switch (kind) {
    case "blog_post":
      return {
        title,
        excerpt: `Read more about ${title.toLowerCase()} in our latest blog post.`,
      };
    case "podcast_episode":
      return {
        title,
        description: `Listen to our latest episode: ${title}.`,
      };
    case "award_item":
      return {
        title,
        description: `We are proud to announce that we have been recognized with ${title}.`,
      };
    default:
      return { title };
  }
}

export async function generateBlockContent(
  blockId: string,
  tenantId: string,
): Promise<{ generated: number }> {
  await assertCanEditContent(tenantId);

  const [tenant] = await db
    .select({ id: tenants.id, defaultLocale: tenants.defaultLocale, locales: tenants.locales })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Tenant not found");

  const defaultLocale = tenant.defaultLocale;

  const [block] = await db
    .select({ id: blocks.id, type: blocks.type, translations: blocks.translations })
    .from(blocks)
    .where(eq(blocks.id, blockId))
    .limit(1);

  if (!block) throw new Error("Block not found");

  const blockType = block.type as BlockKind;
  let generated = 0;

  // ── Seed block-level translations ──────────────────────────────────
  const hasTranslatableFields = BLOCK_TYPES_WITH_TRANSLATIONS.has(blockType);

  if (hasTranslatableFields) {
    const existing = (block.translations ?? {}) as Record<string, Record<string, string>>;
    const hasContentInAnyLocale = Object.values(existing).some((loc) =>
      Object.values(loc).some((v) => typeof v === "string" && v.trim().length > 0),
    );

    if (!hasContentInAnyLocale) {
      const placeholder = generateBlockPlaceholder(blockType);
      const seeded: Record<string, Record<string, string>> = {
        ...existing,
        [defaultLocale]: placeholder,
      };
      await db
        .update(blocks)
        .set({ translations: seeded, updatedAt: new Date() })
        .where(eq(blocks.id, blockId));
      generated++;
    }
  }

  // ── Seed entity translations ───────────────────────────────────────
  const entityList = await db
    .select({ id: tenantEntities.id, slug: tenantEntities.slug, kind: tenantEntities.kind })
    .from(tenantEntities)
    .where(and(eq(tenantEntities.tenantId, tenantId), eq(tenantEntities.blockId, blockId)));

  for (const entity of entityList) {
    const existingRows = await db
      .select({ id: tenantTranslations.id, payload: tenantTranslations.payload, locale: tenantTranslations.locale })
      .from(tenantTranslations)
      .where(
        and(
          eq(tenantTranslations.tenantId, tenantId),
          eq(tenantTranslations.entityId, entity.id),
        ),
      );

    const hasContentInAnyLocale = existingRows.some((r) => {
      const p = r.payload as Record<string, string>;
      return Object.values(p).some((v) => typeof v === "string" && v.trim().length > 0);
    });

    if (hasContentInAnyLocale) continue;

    const placeholder = generateEntityPlaceholder(entity.kind, entity.slug ?? "item");

    // Prefer updating the default locale row; otherwise insert
    const defaultRow = existingRows.find((r) => r.locale === defaultLocale);
    if (defaultRow) {
      await db
        .update(tenantTranslations)
        .set({ payload: placeholder, translationStatus: "translated", updatedAt: new Date() })
        .where(eq(tenantTranslations.id, defaultRow.id));
    } else {
      await db.insert(tenantTranslations).values({
        tenantId,
        entityId: entity.id,
        locale: defaultLocale,
        payload: placeholder,
        translationStatus: "translated",
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    generated++;
  }

  return { generated };
}
