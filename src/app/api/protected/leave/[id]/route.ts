import { NextRequest } from "next/server"
import { updateLeaveStatus } from "@/app/controllers/leave.controller"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  return updateLeaveStatus(req, id)
}