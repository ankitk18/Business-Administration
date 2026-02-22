import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const { companySlug, email, password } = await req.json()

    // 1️ Basic validation
    if (!companySlug || !email || !password) {
      return NextResponse.json(
        { error: "Company, email and password are required" },
        { status: 400 }
      )
    }

    // 2️ Find company
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

    // 3️ Find user (unique composite key)
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

    // 4️ Compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // 5️ Generate JWT
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role
    })

    // 6️ Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        employeeId: user.employee?.id || null
      }
    })

    // 7️ Set secure HttpOnly cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response

  } catch (error) {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}