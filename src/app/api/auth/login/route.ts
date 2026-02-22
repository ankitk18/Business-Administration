import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateToken, verifyToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      const payload = verifyToken(token)

      return NextResponse.json({ success: true, user: payload })
    }

    const { email, password, companyId } = await req.json()

    const user = await prisma.user.findUnique({
      where: {
        companyId_email: { companyId, email }
      }
    })

    if (!user)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const valid = await bcrypt.compare(password, user.password)

    if (!valid)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role
    })

    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 400 })
  }
}