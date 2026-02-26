import { NextRequest } from "next/server"
import { getLeaveRequests } from "@/controllers/leave.controller"

export async function GET(req: NextRequest) {
  return getLeaveRequests(req)
}