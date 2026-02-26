import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: NextRequest) {
  try {
    // 1️ Authenticate
    const user = await requireAuth()

    if (user.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      )
    }

    // 2️ Get manager department (optional but safe)
    const manager = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { departmentId: true }
    })

    if (!manager?.departmentId) {
      return NextResponse.json(
        { message: "Manager has no department assigned" },
        { status: 400 }
      )
    }

    // 3️ Get query params
    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")
    const skip = (page - 1) * limit

    // 4️ Build where condition cleanly
    const whereCondition: any = {
      companyId: user.companyId,
      departmentId: manager.departmentId
    }

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeCode: { contains: search, mode: "insensitive" } }
      ]
    }

    // 5️ Fetch employees
    const employees = await prisma.employee.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            role: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc"
      }
    })

    const total = await prisma.employee.count({
      where: whereCondition
    })

    return NextResponse.json({
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}