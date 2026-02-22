import { verifyToken } from "@/lib/jwt"

export interface AuthUser {
  userId: string
  companyId: string
  role: string
}

/**
 * Authenticate using token directly
 */
export function authenticateToken(token: string): AuthUser {
  if (!token) {
    throw new Error("Unauthorized")
  }

  try {
    return verifyToken(token)
  } catch {
    throw new Error("Invalid or expired token")
  }
}

/**
 * Role-based authorization using token
 */
export function authorizeToken(token: string, roles: string[]): AuthUser {
  const user = authenticateToken(token)

  if (!roles.includes(user.role)) {
    throw new Error("Forbidden")
  }

  return user
}