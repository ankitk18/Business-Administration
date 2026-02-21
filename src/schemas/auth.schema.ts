import { z } from "zod"

export const registerSchema = z.object({
  companyName: z.string().min(2),
  subdomain: z.string().min(2),
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})
