"use client";

import { AuthView } from "@neondatabase/auth-ui";
import "@neondatabase/auth-ui/css";

export function AuthViewClient({ pathname }: { pathname: string }) {
  return <AuthView pathname={pathname} />;
}
