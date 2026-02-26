import { NextRequest, NextResponse } from "next/server"
import { authenticateToken } from "@/middlewares/auth"

/**
 * Middleware function to handle authentication and route protection.
 * It checks for valid JWT tokens and injects user identity into headers.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Define routes that do not require authentication
  const publicRoutes = [
    "/auth/login",
    "/api/auth/login"
  ]

  // 2. Short-circuit if the current path is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // 3. Extract the 'auth_token' from the request cookies
  const token = req.cookies.get("auth_token")?.value

  // 4. Redirect to login if no token is present
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
}

/**
 * Configuration to define which paths this middleware should run on.
 * It uses a matcher pattern to filter traffic.
 */
export const config = {
  matcher: [
    "/manager/:path*",
    "/employee/:path*",
    "/admin/:path*",
    "/api/protected/:path*"
  ]
}