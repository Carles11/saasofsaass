"use client"

import { AuthView } from "@neondatabase/auth-ui"
import "@neondatabase/auth-ui/css"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          Sign In
        </h1>
        <AuthView pathname="sign-in" />
      </div>
    </div>
  )
}
