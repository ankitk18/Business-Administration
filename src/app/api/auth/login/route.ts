import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/jwt"

/**
 * POST handler for user authentication.
 * Validates credentials against a specific company context and issues a secure JWT cookie.
 */
export async function POST(req: NextRequest) {
  try {
    // Extract login credentials from the request body
    const { companySlug, email, password } = await req.json()

    // 1. Basic validation: Ensure all required fields are present
    if (!companySlug || !email || !password) {
      return NextResponse.json(
        { error: "Company, email and password are required" },
        { status: 400 }
      )
    }

    // 2. Multi-tenant Check: Verify the company exists and is active
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      select: { id: true, status: true }
    })

    if (!company || company.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Company not found or inactive" },
        { status: 404 }
      )
    }

    // 3. User Lookup: Find the user linked specifically to this company
    // Uses a composite unique key (companyId + email)
    const user = await prisma.user.findUnique({
      where: {
        companyId_email: {
          companyId: company.id,
          email: email
        }
      },
      include: {
        employee: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // 4. Password Verification: Compare plain-text password with stored hash
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid Password" },
        { status: 401 }
      )
    }

    // 5. Token Generation: Create a JWT containing the user's identity and permissions
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role
    })

    // 6. Response Construction: Return essential user data to the frontend
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        employeeId: user.employee?.id || null
      }
    })

    // 7. Secure Cookie Storage:
    // httpOnly: Prevents client-side JS from accessing the token (XSS protection)
    // secure: Ensures cookies are only sent over HTTPS in production
    // maxAge: Persists the session for 7 days
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } 
  catch (error) {
    // Log error internally if needed (e.g., console.error(error))
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}