import { createAuthServer } from "@neondatabase/auth/next/server"

export const authServer = createAuthServer()

export type AuthSession = Awaited<ReturnType<typeof authServer.getSession>>["data"]
