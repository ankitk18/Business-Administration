import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function GET(req: NextRequest){
    try{
        //1. Get token from cookies
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if(!token){
            return NextResponse.json(
                {message: "Unauthorized"}, 
                {status: 401}
            )
        }

        //2. Verify Jwt
        const decoded = verifyToken(token)

        const {userId, companyId, role} = decoded

        if(role !== "MANAGER"){
            return NextResponse.json({ message: "Access denied" }, { status: 403 })
        }

        //3. Get Manager's Department
        const manager = await prisma.user.findUnique({
            where: {id: userId},
            select: {departmentId: true}
        })

        if (!manager?.departmentId) {
            return NextResponse.json(
                { message: "Manager has no department assigned" },
                { status: 400 }
            )
        }

        //4. Get Search Parameters
        const { searchParams } = new URL(req.url)

        const search = searchParams.get("search") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "5")
        const skip = (page-1)* limit

        //5. Fetch Employees
        const employees = await prisma.employee.findMany({
            where: {
                companyId,
                departmentId: manager.departmentId,
                OR: search
                ? [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { employeeCode: { contains: search, mode: "insensitive" } }
                    ]
                : undefined
            },

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
            where: {
                companyId,
                departmentId: manager.departmentId,
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { employeeCode: { contains: search, mode: "insensitive" } }
                ],
            }
        })

        return NextResponse.json({
            data: employees,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total/limit)
            }
        })

        }catch(error){
            console.error(error)
            return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
            )
        }
}
