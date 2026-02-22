import "dotenv/config"
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
//import { authorize } from '@/middlewares/auth' 

export async function POST(req: NextRequest){
    try{
        //const manager =  authorize(['MANAGER'])(req)

        const {name, email, password, departmentName, position, companySlug} = await req.json()
        const hashed = await bcrypt.hash(password,10)

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
        return NextResponse.json({ error: "Failed" }, { status: 400 })
    }
}