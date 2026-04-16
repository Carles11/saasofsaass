"use client";

import { useRef } from "react";
import { useStore } from "@/5-shared/store";
import type { Tenant } from "@/5-shared/lib/db/schema";

interface StoreHydratorProps {
  tenant: Tenant | null;
  children: React.ReactNode;
}

/**
 * COMPONENT: StoreHydrator
 * Injects Server-side data into the Zustand client store on first render.
 * Critical for "Bentley" speed - zero flashes of empty state.
 * Uses absolute path alias for reliable module resolution.
 */
export function StoreHydrator({ tenant, children }: StoreHydratorProps) {
  const hydrated = useRef(false);

  if (!hydrated.current && tenant) {
    // Access the store directly to perform the initial hydration
    useStore.getState().setTenant(tenant);
    hydrated.current = true;
  }

  return <>{children}</>;
}