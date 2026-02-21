import { NextResponse } from "next/server"
import { registerCompany } from "@/services/auth.services"
import { registerSchema } from "@/schemas/auth.schema"

export async function POST(req: Request) {

  try {

    // Parse request body
    const body = await req.json()

    // Validate input using Zod
    const data = registerSchema.parse(body)

    // Create company and admin user
    const result = await registerCompany(data)

    // Return success response
    return NextResponse.json(result)

  } catch (error: any) {

    // Return error response if validation or creation fails
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )

  }

}
