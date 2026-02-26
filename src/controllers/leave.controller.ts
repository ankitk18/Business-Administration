import { prisma } from "@/lib/prisma"
import { LeaveStatus } from "@/generated/prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

export const getLeaveRequests = async (req: NextRequest) => {
  try {

    // 1️ Authenticate (unchanged)
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")
    const skip = (page - 1) * limit

    const baseWhere: any = {
      companyId: user.companyId
    }


    if (user.role === "MANAGER" && user.departmentId) {
      baseWhere.employee = {
        departmentId: user.departmentId
      }
    }

    if (user.role === "USER") {
      baseWhere.employee = {
        userId: user.userId
      }
    }


    const whereCondition: any = { ...baseWhere }

    // Search filtering (unchanged logic, but applied safely)
    if (search) {
      whereCondition.OR = [
        {
          employee: {
            name: { contains: search, mode: "insensitive" }
          }
        },
        {
          leaveType: { contains: search, mode: "insensitive" }
        }
      ]
    }


    // Fetch Leaves 


    const leaves = await prisma.leaveRequest.findMany({
      where: whereCondition,
      include: {
        employee: {
          include: { department: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    })

    const total = await prisma.leaveRequest.count({
      where: whereCondition
    })


    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const pending = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,          
        status: "PENDING"
      }
    })

    const approvedMonth = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,          
        status: "APPROVED",
        reviewedAt: { gte: startOfMonth }
      }
    })

    const rejectedMonth = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,          
        status: "REJECTED",
        reviewedAt: { gte: startOfMonth }
      }
    })

    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,          
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today }
      }
    })

    return NextResponse.json({
      data: leaves,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        pending,
        approvedMonth,
        rejectedMonth,
        onLeaveToday
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch leave requests" },
      { status: 401 }
    )
  }
}

export const updateLeaveStatus = async (
  req: NextRequest,
  leaveId: string
) => {
  try {
    // 1️ Authenticate
    const user = await requireAuth()

    // Only ADMIN or MANAGER
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { action } = await req.json()

    const leave = await prisma.leaveRequest.findFirst({
      where: {
        id: leaveId,
        companyId: user.companyId
      },
      include: { employee: true }
    })

    if (!leave) {
      return NextResponse.json(
        { error: "Leave not found" },
        { status: 404 }
      )
    }

    // Manager can only manage own department
    if (
      user.role === "MANAGER" &&
      user.departmentId &&
      leave.employee.departmentId !== user.departmentId
    ) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      )
    }

    let newStatus: LeaveStatus | null = null

    if (action === "APPROVE") newStatus = "APPROVED"
    if (action === "REJECT") newStatus = "REJECTED"
    if (action === "RESET") newStatus = "PENDING"

    if (!newStatus) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: newStatus,
        reviewedById: newStatus === "PENDING" ? null : user.userId,
        reviewedAt: newStatus === "PENDING" ? null : new Date()
      }
    })

    return NextResponse.json({
      message: `Leave ${newStatus.toLowerCase()}`,
      leave: updated
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Operation failed" },
      { status: 401 }
    )
  }
}