import { prisma } from "../lib/prisma"
import { hashPassword, comparePassword } from "../lib/auth"
import { generateToken } from "../lib/auth"


// REGISTER COMPANY + ADMIN
export async function registerCompany(data: {
  companyName: string
  subdomain: string
  name: string
  email: string
  password: string
}) {

  // Check if company already exists with same subdomain
  const existingCompany = await prisma.company.findUnique({
    where: { subdomain: data.subdomain }
  })

  if (existingCompany)
    throw new Error("Company exists")


  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser)
    throw new Error("User exists")


  // Hash password before storing
  const hashed = await hashPassword(data.password)


  // Use transaction so both company and user are created together
  return prisma.$transaction(async (tx) => {

    const company = await tx.company.create({
      data: {
        name: data.companyName,
        subdomain: data.subdomain
      }
    })


    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        role: "ADMIN",
        companyId: company.id
      }
    })


    // Generate auth token for immediate login
    const token = generateToken({
      userId: user.id,
      companyId: company.id,
      role: user.role
    })


    return {
      token,
      user,
      company
    }

  })

}


// LOGIN
export async function loginUser(data: {
  email: string
  password: string
}) {

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user)
    throw new Error("Invalid credentials")


  // Compare entered password with stored hash
  const valid = await comparePassword(
    data.password,
    user.password
  )

  if (!valid)
    throw new Error("Invalid credentials")


  // Generate token if login is successful
  const token = generateToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role
  })


  return {
    token,
    user
  }

}
