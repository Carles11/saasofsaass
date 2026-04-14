import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Use a fallback for local development (localhost:3000)
  const hostname = req.headers.get('host') || 'saasofsaass.com';

  // 1. Define the primary domains
  // TIP: In production, these should come from process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const rootDomain = 'saasofsaass.com';
  const appDomain = `app.${rootDomain}`;

  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

  // CASE 1: Marketing Site (saasofsaass.com)
  if (hostname === rootDomain || hostname === 'localhost:3000') {
    return NextResponse.rewrite(new URL(`/(marketing)${path}`, req.url));
  }

  // CASE 2: The Dashboard (app.saasofsaass.com)
  if (hostname === appDomain || hostname === `app.localhost:3000`) {
    return NextResponse.rewrite(new URL(`/(dashboard)${path}`, req.url));
  }

  // CASE 3: Dynamic Tenants (e.g., agora.com or tenant.saasofsaass.com)
  /** * CRITICAL FIX: 
   * We must rewrite to '/[domain]' because that is the folder name 
   * in your /src/app directory. Next.js will automatically 
   * pass the 'hostname' as the 'domain' param to your page.
   */
  return NextResponse.rewrite(new URL(`/[domain]${path}`, req.url));
}