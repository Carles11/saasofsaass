"use client";

import { useEffect } from "react";

/**
 * Forces a reload when the page is restored from bfcache (cross-origin back navigation).
 * Without this, Radix UI portals and other event-listener-dependent components
 * lose their listeners and stop responding after navigating away and returning.
 */
export function BfcacheHandler() {
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) window.location.reload();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
