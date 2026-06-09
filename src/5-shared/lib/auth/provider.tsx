"use client"

import { NeonAuthUIProvider } from "@neondatabase/auth-ui"
import "@neondatabase/auth-ui/css"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "./client"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  )
}
