import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";

interface SiteUnavailablePageProps {
  /** "draft" → exists but not published; "missing" → no such tenant. */
  reason: "draft" | "missing";
  /** Subdomain slug (or hostname) the visitor tried to reach. */
  slug: string;
  locale: string;
}

export async function SiteUnavailablePage({
  reason,
  slug,
  locale,
}: SiteUnavailablePageProps) {
  const t = await getPlatformTranslations("site-unavailable", locale);
  const host = slug ? `${slug}.${ROOT_DOMAIN}` : ROOT_DOMAIN;
  const isDraft = reason === "draft";

  const title = isDraft
    ? resolveTranslation(t, "draft.title", "This site isn't live yet")
    : resolveTranslation(t, "missing.title", "{host} is available", { host });
  const body = isDraft
    ? resolveTranslation(
        t,
        "draft.body",
        "The owner is still putting it together. Check back soon.",
      )
    : resolveTranslation(
        t,
        "missing.body",
        "No site lives at this address yet. Build yours in minutes.",
      );
  const ctaLabel = resolveTranslation(t, "missing.cta", "Create your site");
  const poweredBy = resolveTranslation(t, "powered-by", "Powered by SaaSofSaaSs");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-24 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl"
          aria-hidden="true"
        >
          {isDraft ? "🚧" : "✨"}
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="leading-relaxed text-muted-foreground">{body}</p>
        </div>

        {!isDraft && (
          <a
            href={appAuthUrl("sign-up", locale)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {ctaLabel}
          </a>
        )}

        <p className="mt-4 text-xs text-muted-foreground">{poweredBy}</p>
      </div>
    </main>
  );
}
