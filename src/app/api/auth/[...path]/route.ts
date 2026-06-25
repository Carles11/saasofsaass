import { authApiHandler } from "@neondatabase/auth/next/server"

const ROOT_DOMAIN = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
).toLowerCase()

const handler = authApiHandler()

/**
 * Production / shared-domain mode: ensure every auth cookie carries the
 * shared parent Domain (e.g. ".saasofsaass.com") so the session is visible
 * across marketing, app, and tenant subdomains.
 */
async function patchCookieSharedDomain(
  response: Response,
  domain: string,
): Promise<Response> {
  const setCookies = response.headers.getSetCookie?.()
  if (!setCookies?.length) return response

  const newHeaders = new Headers(response.headers)
  newHeaders.delete("Set-Cookie")

  for (const cookie of setCookies) {
    if (/Domain=/i.test(cookie)) {
      newHeaders.append("Set-Cookie", cookie)
    } else {
      newHeaders.append("Set-Cookie", `${cookie}; Domain=${domain}`)
    }
  }

  return rebuild(response, newHeaders)
}

/**
 * Dev mode on a *.localhost host: Chrome rejects any explicit `Domain` that
 * points at `localhost` (it's treated as a special TLD), and `Partitioned` +
 * `SameSite=None` add further breakage. We strip Domain entirely so the cookie
 * becomes "host-only" (bound to the exact host that set it — e.g. app.localhost),
 * which Chrome stores and resends reliably. Secure is kept (required by the
 * `__Secure-` cookie-name prefix; *.localhost counts as a secure context over http).
 */
async function patchCookieHostOnly(response: Response): Promise<Response> {
  const setCookies = response.headers.getSetCookie?.()
  if (!setCookies?.length) return response

  const newHeaders = new Headers(response.headers)
  newHeaders.delete("Set-Cookie")

  for (const cookie of setCookies) {
    const stripped = cookie
      .replace(/;\s*Domain=[^;]*/gi, "")
      .replace(/;\s*SameSite=[^;]*/gi, "")
      .replace(/;\s*Partitioned/gi, "")
    newHeaders.append("Set-Cookie", `${stripped}; SameSite=Lax`)
  }

  return rebuild(response, newHeaders)
}

async function rebuild(response: Response, headers: Headers): Promise<Response> {
  const body = await response.text()
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function wrapHandler(
  nextHandler: (req: Request, ctx: { params: Promise<{ path: string[] }> }) => Promise<Response>,
) {
  return async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => {
    const url = new URL(req.url)
    const hostname = url.hostname
    const isDev =
      hostname === "localhost" ||
      hostname.endsWith(".localhost")

    if (!isDev) {
      // Production: share the session cookie across all subdomains.
      const response = await nextHandler(req, ctx)
      return patchCookieSharedDomain(response, `.${ROOT_DOMAIN}`)
    }

    // Dev: Neon Auth's allow_localhost only matches exact "localhost" — not
    // subdomains. Override Origin to root localhost so subdomain requests
    // (app.localhost, *.localhost) pass Neon Auth's origin validation.
    const rootOrigin = `${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`
    const headers = new Headers(req.headers)
    headers.set("Origin", rootOrigin)
    headers.set("Referer", `${rootOrigin}/`)

    const body = req.body
    const newReq = new Request(req.url, {
      method: req.method,
      headers,
      // @ts-expect-error - duplex required for streaming body in some runtimes
      duplex: "half",
      body,
    })

    const response = await nextHandler(newReq, ctx)

    // Host-only cookie — bound to the exact host (app.localhost). Reliable in
    // dev where Chrome rejects any explicit Domain pointing at localhost.
    return patchCookieHostOnly(response)
  }
}

export const GET = wrapHandler(handler.GET!)
export const POST = wrapHandler(handler.POST!)
