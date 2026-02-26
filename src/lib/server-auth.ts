import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  try {
    return verifyToken(token)
  } catch {
    throw new Error("Invalid or expired token")
  }
}