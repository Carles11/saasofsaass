import { authApiHandler } from "@neondatabase/auth/next/server"

const ROOT_DOMAIN = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
).toLowerCase()

const handler = authApiHandler()

async function patchCookieDomain(
  response: Response,
  rootDomain: string,
): Promise<Response> {
  const setCookies = response.headers.getSetCookie?.()
  if (!setCookies?.length) return response

  const newHeaders = new Headers(response.headers)
  newHeaders.delete("Set-Cookie")

  for (const cookie of setCookies) {
    if (/Domain=/i.test(cookie)) {
      newHeaders.append("Set-Cookie", cookie)
    } else {
      newHeaders.append("Set-Cookie", `${cookie}; Domain=${rootDomain}`)
    }
  }

  const body = await response.text()
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
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
      const response = await nextHandler(req, ctx)
      return patchCookieDomain(response, `.${ROOT_DOMAIN}`)
    }

    // Neon Auth validates the Origin header against its allowlist.
    // Local dev subdomains (app.localhost) are not in that list.
    // Override the Origin to the root localhost so Neon Auth accepts the proxy.
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
    return patchCookieDomain(response, ".localhost")
  }
}

export const GET = wrapHandler(handler.GET!)
export const POST = wrapHandler(handler.POST!)
