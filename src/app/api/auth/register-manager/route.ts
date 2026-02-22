import "dotenv/config"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

/**
 * POST handler for Manager registration.
 * This endpoint creates a User with elevated permissions ('MANAGER') 
 * and a corresponding Employee record within a specific company and department.
 */
export async function POST(req: NextRequest) {
  try {
    
    // 1. Destructure registration details from the request body
    const { name, email, password, departmentName, companySlug } = await req.json()

    // 2. Hash the password for secure storage
    const hashed = await bcrypt.hash(password, 10)

    // 3. Multi-tenant Validation: Verify the existence of the company by its slug
    const company = await prisma.company.findUnique({
      where: {
        slug: companySlug
      },
      select: {
                id: true
            }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    const companyId = company.id

    // 4. Department Validation: Ensure the department belongs to the verified company
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
    
    // 5. Create User Record: Specifically assigned the 'MANAGER' role for RBAC
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

    // 6. Create Employee Record: Links the HR profile to the newly created User ID
    // position is hardcoded to "Manager" for this specific registration flow
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

    // Return success status if both database operations complete
    return NextResponse.json({ success: true })
  } catch {
    // Catch block for database constraint violations (e.g., duplicate email) or server errors
    return NextResponse.json({ error: "Failed" }, { status: 400 })
  }
}