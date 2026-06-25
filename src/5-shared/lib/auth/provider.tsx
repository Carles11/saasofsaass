"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth-ui"
// CSS loaded only in AuthViewClient.tsx via @neondatabase/auth-ui/tailwind (layered, no utility duplication)
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "./client"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? "en"

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      Link={Link}
      redirectTo={`/${locale}/dashboard`}
    >
      {children}
    </NeonAuthUIProvider>
  )
}
