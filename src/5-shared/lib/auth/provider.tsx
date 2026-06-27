"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth-ui"
// All auth forms use custom shadcn components — no library AuthView CSS needed
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
      basePath={`/${locale}/auth`}
      redirectTo={`/${locale}/dashboard`}
    >
      {children}
    </NeonAuthUIProvider>
  )
}
