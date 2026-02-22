import "dotenv/config"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    
    const { name, email, password, departmentName } = await req.json()
    const companyId = process.env.COMPANY_ID!
    const hashed = await bcrypt.hash(password, 10)

    const uniqueDepartmentId = await prisma.department.findFirst({
      where: {
        name: departmentName,
        companyId: companyId
      },
      select: {
        id: true
      }
    })

    if (!uniqueDepartmentId) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 400 }
      )
    }
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "MANAGER",
        companyId: companyId,
        departmentId: uniqueDepartmentId.id
      }
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        name,
        email,
        employeeCode: `EMP-${Date.now()}`,
        position: "Manager",
        departmentId: uniqueDepartmentId.id,
        companyId: companyId,
        joinDate: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 400 })
  }
}