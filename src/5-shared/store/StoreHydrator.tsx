"use client";
import { useRef } from "react";
import { useStore } from "./index";

interface StoreHydratorProps {
  locale: string;
  dictionary: Record<string, string>;
  isRTL?: boolean;
  children: React.ReactNode;
}

export function StoreHydrator({ locale, dictionary, isRTL = false, children }: StoreHydratorProps) {
  const hydrated = useRef(false);
  if (!hydrated.current) {
    useStore.getState().setI18n(locale, dictionary, isRTL);
    hydrated.current = true;
  }
  return <>{children}</>;
}
