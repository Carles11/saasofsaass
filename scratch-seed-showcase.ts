/**
 * Scratch seed — content-rich PUBLISHED "showcase" tenant for template design.
 * Re-runnable: wipes the showcase tenant's blocks/entities/translations and
 * re-creates them. Used to render + screenshot all 11 templates.
 *
 *   ./node_modules/.bin/tsx scratch-seed-showcase.ts
 */
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const IMG = {
  hero: "https://picsum.photos/seed/soss-hero/1600/1000",
  post1: "https://picsum.photos/seed/soss-post1/1200/800",
  post2: "https://picsum.photos/seed/soss-post2/1200/800",
  post3: "https://picsum.photos/seed/soss-post3/1200/800",
};

(async () => {
  const { db } = await import("./src/5-shared/lib/db");
  const {
    tenants,
    blocks,
    tenantEntities,
    tenantTranslations,
    workspaces,
  } = await import("./src/5-shared/lib/db/schema");
  const { profiles } = await import("./src/5-shared/lib/db/schema/auth");
  const { eq, inArray } = await import("drizzle-orm");

  // ── Owner + workspace (reuse first existing, else create) ────────────────
  let [ws] = await db.select({ id: workspaces.id }).from(workspaces).limit(1);
  if (!ws) {
    const email = "showcase@saasofsaass.com";
    const [p] = await db
      .insert(profiles)
      .values({ email, name: "Showcase Owner", role: "user" })
      .onConflictDoNothing({ target: profiles.email })
      .returning({ id: profiles.id });
    const ownerId =
      p?.id ??
      (await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1))[0].id;
    [ws] = await db
      .insert(workspaces)
      .values({ name: "Showcase Account", ownerProfileId: ownerId, plan: "enterprise", siteLimit: -1 })
      .returning({ id: workspaces.id });
  }
  const workspaceId = ws.id;

  // ── Tenant (upsert by slug) ──────────────────────────────────────────────
  let [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, "showcase"))
    .limit(1);
  if (!tenant) {
    [tenant] = await db
      .insert(tenants)
      .values({
        name: "Lumen Studio",
        slug: "showcase",
        locales: ["en"],
        defaultLocale: "en",
        status: "published",
        templateId: "default",
        branding: {},
        workspaceId,
      })
      .returning({ id: tenants.id });
  } else {
    await db
      .update(tenants)
      .set({ name: "Lumen Studio", status: "published", workspaceId })
      .where(eq(tenants.id, tenant.id));
  }
  const tenantId = tenant.id;

  // ── Wipe existing blocks + entities + translations ───────────────────────
  const existingBlocks = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId));
  const blockIds = existingBlocks.map((b) => b.id);
  const ents = await db
    .select({ id: tenantEntities.id })
    .from(tenantEntities)
    .where(eq(tenantEntities.tenantId, tenantId));
  const entIds = ents.map((e) => e.id);
  if (entIds.length) {
    await db.delete(tenantTranslations).where(inArray(tenantTranslations.entityId, entIds));
    await db.delete(tenantEntities).where(inArray(tenantEntities.id, entIds));
  }
  if (blockIds.length) {
    await db.delete(blocks).where(inArray(blocks.id, blockIds));
  }

  // ── Blocks ───────────────────────────────────────────────────────────────
  let order = 0;
  const mk = (type: string, config: any, translations: any) =>
    db.insert(blocks).values({ tenantId, type, order: order++, isVisible: true, config, translations }).returning({ id: blocks.id });

  await mk(
    "hero",
    { layout: "centered", ctaUrl: "#contact", heroImage: { url: IMG.hero, alt: "Sunlit studio interior with soft shadows" } },
    { en: { title: "Design that feels effortless", subtitle: "We craft calm, considered digital experiences for brands that care about the details.", ctaLabel: "Start a project" } },
  );

  await mk(
    "text-content",
    {},
    { en: {
      heading: "A studio built around clarity",
      body: "Lumen is a small, senior team of designers and engineers. We partner with founders and growing teams to turn fuzzy ideas into products people love to use.\n\nNo bloat, no hand-offs to junior staff — just focused work, shipped fast, with craft you can feel in every interaction.",
    } },
  );

  const [testimonials] = await mk(
    "testimonials",
    { maxItems: 12 },
    { en: { heading: "Loved by the teams we work with", emptyState: "No testimonials yet." } },
  );

  const [blog] = await mk(
    "blog-feed",
    { maxItems: 9, archivePath: "/blog" },
    { en: {} },
  );

  await mk(
    "cta-banner",
    { ctaUrl: "#contact" },
    { en: { heading: "Have a project in mind?", subtitle: "We take on a handful of partners each quarter. Tell us what you're building.", ctaLabel: "Get in touch" } },
  );

  await mk(
    "contact",
    { email: "hello@lumen.studio", phone: "+1 (415) 555-0142", address: "210 Valencia St, San Francisco, CA" },
    { en: { title: "Let's talk", description: "Tell us about your project and we'll get back within two business days." } },
  );

  await mk(
    "footer",
    { showPoweredBy: true, email: "hello@lumen.studio", phone: "+1 (415) 555-0142", socialLinks: [
      { label: "Instagram", url: "https://instagram.com" },
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "Dribbble", url: "https://dribbble.com" },
    ] },
    { en: { description: "Lumen Studio — calm, considered digital design." } },
  );

  // ── Testimonial entities ─────────────────────────────────────────────────
  const testimonialData = [
    { slug: "maya-chen", quote: "Lumen translated a vague vision into a product our customers genuinely love. The craft shows everywhere.", author: "Maya Chen", role: "CEO, Northwind", rating: 5 },
    { slug: "diego-ramos", quote: "Fast, senior, and zero drama. They shipped more in six weeks than our last agency did in six months.", author: "Diego Ramos", role: "Founder, Tidal", rating: 5 },
    { slug: "aisha-okafor", quote: "Every detail considered. The kind of partner you keep on speed dial.", author: "Aisha Okafor", role: "Head of Product, Vela", rating: 5 },
  ];
  let tOrder = 0;
  for (const d of testimonialData) {
    const [e] = await db.insert(tenantEntities).values({
      tenantId, blockId: testimonials.id, kind: "testimonial", status: "published",
      order: tOrder++, slug: d.slug, coverImageUrl: null,
      metadata: { authorRole: d.role, rating: d.rating }, publishedAt: new Date(),
    }).returning({ id: tenantEntities.id });
    await db.insert(tenantTranslations).values({
      tenantId, entityId: e.id, locale: "en", translationStatus: "translated", isLocked: false,
      payload: { title: d.author, quote: d.quote },
    });
  }

  // ── Blog post entities ───────────────────────────────────────────────────
  const postData = [
    { slug: "design-systems-that-last", cover: IMG.post1, title: "Design systems that actually last", excerpt: "Why most design systems rot in a year — and the small set of rules that keep ours alive.", body: "A design system is a product, not a deliverable..." },
    { slug: "shipping-with-taste", cover: IMG.post2, title: "Shipping fast without losing taste", excerpt: "Speed and craft aren't opposites. Here's how we hold both at once.", body: "Taste is a muscle. Speed is a system..." },
    { slug: "the-quiet-interface", cover: IMG.post3, title: "The quiet interface", excerpt: "The best UI gets out of the way. Notes on restraint, hierarchy, and calm.", body: "Loud interfaces exhaust people..." },
  ];
  let pOrder = 0;
  for (const d of postData) {
    const [e] = await db.insert(tenantEntities).values({
      tenantId, blockId: blog.id, kind: "blog_post", status: "published",
      order: pOrder++, slug: d.slug, coverImageUrl: d.cover,
      metadata: { author: "Lumen Studio", readingTimeMinutes: 4 }, publishedAt: new Date(),
    }).returning({ id: tenantEntities.id });
    await db.insert(tenantTranslations).values({
      tenantId, entityId: e.id, locale: "en", translationStatus: "translated", isLocked: false,
      payload: { title: d.title, excerpt: d.excerpt, body: d.body },
    });
  }

  console.log(`✓ Showcase tenant ready: showcase.localhost:3000/en  (tenantId ${tenantId})`);
  process.exit(0);
})();
