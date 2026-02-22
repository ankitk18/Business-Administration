import { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function authenticate(req: NextRequest) {
  const header = req.headers.get("authorization")

  if (!header || !header.startsWith("Bearer "))
    throw new Error("Unauthorized")

  const token = header.split(" ")[1]
  return verifyToken(token)
}

export function authorize(roles: string[]) {
  return (req: NextRequest) => {
    const user = authenticate(req)

    if (!roles.includes(user.role))
      throw new Error("Forbidden")

    return user
  }
}