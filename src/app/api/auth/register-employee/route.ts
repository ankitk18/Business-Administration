import "dotenv/config"
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * POST handler for creating a new Employee/User.
 * This handles password hashing, multi-tenant checks (Company/Department), 
 * and double-entry creation in both User and Employee tables.
 */
export async function POST(req: NextRequest){
    try{

        // 1. Extract payload from request body
        const {name, email, password, departmentName, position, companySlug} = await req.json()

        // 2. Hash the password before storing (Cost factor: 10)
        const hashed = await bcrypt.hash(password,10)

        // 3. Multi-tenant Lookup: Verify the company exists by its unique slug
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

    // 4. Context Lookup: Find the specific department within that company
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

    // 5. User Creation: Create the authentication profile
    // Note: 'user' here is a promise that needs to be awaited or handled
    const user = prisma.user.create({
        data:{
            name,
            email,
            password: hashed,
            role: "USER",
            companyId: companyId,
            departmentId: uniqueDepartmentId.id
        }
    })

    // 6. Employee Creation: Create the HR/Business profile
    // Uses the ID from the newly created user and generates a timestamp-based employee code
    await prisma.employee.create({
        data: {
            userId: (await user).id,
            name,
            email,
            employeeCode: `EMP-${Date.now()}`,
            position,
            departmentId: uniqueDepartmentId.id,
            companyId: companyId,
            joinDate: new Date()
        }
    })

    return NextResponse.json({ success: true })
    }catch(error){
        // Generic error catch-all; in production, you might want to log the actual error
        return NextResponse.json({ error: "Failed" }, { status: 400 })
    }
}