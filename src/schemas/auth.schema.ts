import { z } from "zod"

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////

export const loginSchema = z.object({

  email: z.email(),
  password: z.string().min(6),
  
})

//////////////////////////////////////////////////////
// REGISTER MANAGER
//////////////////////////////////////////////////////

export const registerManagerSchema = z.object({

  name: z.string(),
  email: z.email(),
  password: z.string().min(6),

})

//////////////////////////////////////////////////////
// REGISTER EMPLOYEE
//////////////////////////////////////////////////////

export const registerEmployeeSchema = z.object({

  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  employeeCode: z.string(),
  departmentId: z.string(),
  position: z.string(),
  salary: z.number(),

})

//////////////////////////////////////////////////////
// REGISTER CUSTOMER
//////////////////////////////////////////////////////

export const registerCustomerSchema = z.object({

  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),

})