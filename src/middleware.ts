/**
 * Next.js edge middleware entry point.
 * Re-exports the implementation from proxy.ts so the routing logic
 * can be imported and tested independently of the Next.js runtime.
 */
export { default, config } from './proxy'
