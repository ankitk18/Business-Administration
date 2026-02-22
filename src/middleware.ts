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
    return NextResponse.redirect(new URL("/api/auth/login", req.url))
  }

  try {
    // 5. Verify the token; this usually throws an error if the token is invalid or expired
    const payload = authenticateToken(token)

    // 6. Clone the request headers and inject user/context data for downstream use
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.userId)
    requestHeaders.set("x-company-id", payload.companyId)
    requestHeaders.set("x-role", payload.role)

    // 7. Proceed to the destination with the new headers
    return NextResponse.next({
      request: { headers: requestHeaders }
    })

  } catch {
    // 8. If token verification fails, redirect back to the login page
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
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