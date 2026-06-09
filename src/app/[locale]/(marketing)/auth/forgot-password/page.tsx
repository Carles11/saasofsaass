"use client"

import { AuthView } from "@neondatabase/auth-ui"
import "@neondatabase/auth-ui/css"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-zinc-900">
          Forgot Password
        </h1>
        <AuthView pathname="forgot-password" />
      </div>
    </div>
  )
}
