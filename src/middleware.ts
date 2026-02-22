import { NextRequest, NextResponse } from "next/server"
import { authenticateToken } from "@/middlewares/auth"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicRoutes = [
    "/auth/login",
    "/api/auth/login"
  ]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/api/auth/login", req.url))
  }

  try {
    const payload = authenticateToken(token)

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.userId)
    requestHeaders.set("x-company-id", payload.companyId)
    requestHeaders.set("x-role", payload.role)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })

  } catch {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/employee/:path*",
    "/admin/:path*",
    "/api/protected/:path*"
  ]
}