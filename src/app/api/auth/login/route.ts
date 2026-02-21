import { NextResponse } from "next/server"
import { loginUser } from "@/services/auth.services"
import { loginSchema } from "@/schemas/auth.schema"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {

  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      
      const token = authHeader.split(" ")[1]
      // Verify token
      const payload = verifyToken(token)

      // Find user from token
      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId
        }
      })

      if (!user) {
        throw new Error("User not found")
      }

      // Token valid → auto login
      return NextResponse.json({
        token,
        user,
        message: "Login successful via token"
      })
    }

    // 2. Fallback to email/password login
    const body = await req.json()

    const data = loginSchema.parse(body)

    const result = await loginUser(data)

    return NextResponse.json({
      ...result,
      message: "Login successful via credentials"
    })

  } catch (error: any) {

    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )

  }

}
