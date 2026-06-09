import { authApiHandler } from "@neondatabase/auth/next/server"

const handler = authApiHandler()

function wrapHandler(
  nextHandler: (req: Request, ctx: { params: Promise<{ path: string[] }> }) => Promise<Response>,
) {
  return async (req: Request, ctx: { params: Promise<{ path: string[] }> }) => {
    const url = new URL(req.url)
    const hostname = url.hostname
    const isDev =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".lvh.me")

    if (!isDev) return nextHandler(req, ctx)

    // Neon Auth validates the Origin header against its allowlist.
    // Local dev subdomains (app.localhost, *.lvh.me) are not in that list.
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

    return nextHandler(newReq, ctx)
  }
}

export const GET = wrapHandler(handler.GET!)
export const POST = wrapHandler(handler.POST!)
