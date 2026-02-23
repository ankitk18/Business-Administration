import "dotenv/config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Loading human test data...")

  const hashed = await bcrypt.hash("password123", 10)

  // 🔹 Get existing company
  const company = await prisma.company.findUnique({
    where: { slug: "dummy-company" }
  })

  if (!company) {
    throw new Error("Company not found")
  }

  const companyId = company.id

  // 🔹 Get Departments
  const hr = await prisma.department.findFirst({ where: { name: "HR", companyId } })
  const devops = await prisma.department.findFirst({ where: { name: "DevOps", companyId } })
  const marketing = await prisma.department.findFirst({ where: { name: "Marketing", companyId } })
  const developers = await prisma.department.findFirst({ where: { name: "Developers", companyId } })

  if (!hr || !devops || !marketing || !developers) {
    throw new Error("Departments missing")
  }

  // ==================================================
  // HR DEPARTMENT
  // ==================================================

  const hrManager = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul.sharma@dummy.com",
      password: hashed,
      role: "MANAGER",
      companyId,
      departmentId: hr.id
    }
  })

  await prisma.employee.create({
    data: {
      userId: hrManager.id,
      name: "Rahul Sharma",
      email: "rahul.sharma@dummy.com",
      employeeCode: "HR-MGR-001",
      position: "HR Manager",
      departmentId: hr.id,
      companyId,
      joinDate: new Date()
    }
  })

  const hrEmployees = [
    ["Anita Verma", "anita.verma@dummy.com"],
    ["Suresh Patel", "suresh.patel@dummy.com"],
    ["Neha Kapoor", "neha.kapoor@dummy.com"],
    ["Amit Joshi", "amit.joshi@dummy.com"],
    ["Pooja Nair", "pooja.nair@dummy.com"]
  ]

  for (const emp of hrEmployees) {
    const user = await prisma.user.create({
      data: {
        name: emp[0],
        email: emp[1],
        password: hashed,
        role: "USER",
        companyId,
        departmentId: hr.id
      }
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        name: emp[0],
        email: emp[1],
        employeeCode: `HR-EMP-${emp[0].split(" ")[0]}`,
        position: "HR Executive",
        departmentId: hr.id,
        companyId,
        joinDate: new Date()
      }
    })
  }

  // ==================================================
  // DEVOPS
  // ==================================================

  const devopsManager = await prisma.user.create({
    data: {
      name: "Arjun Mehta",
      email: "arjun.mehta@dummy.com",
      password: hashed,
      role: "MANAGER",
      companyId,
      departmentId: devops.id
    }
  })

  await prisma.employee.create({
    data: {
      userId: devopsManager.id,
      name: "Arjun Mehta",
      email: "arjun.mehta@dummy.com",
      employeeCode: "DEVOPS-MGR-001",
      position: "DevOps Manager",
      departmentId: devops.id,
      companyId,
      joinDate: new Date()
    }
  })

  const devopsEmployees = [
    ["Rohit Kumar", "rohit.kumar@dummy.com"],
    ["Kiran Reddy", "kiran.reddy@dummy.com"],
    ["Vikram Singh", "vikram.singh@dummy.com"],
    ["Manish Yadav", "manish.yadav@dummy.com"],
    ["Priya Das", "priya.das@dummy.com"]
  ]

  for (const emp of devopsEmployees) {
    const user = await prisma.user.create({
      data: {
        name: emp[0],
        email: emp[1],
        password: hashed,
        role: "USER",
        companyId,
        departmentId: devops.id
      }
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        name: emp[0],
        email: emp[1],
        employeeCode: `DEVOPS-EMP-${emp[0].split(" ")[0]}`,
        position: "DevOps Engineer",
        departmentId: devops.id,
        companyId,
        joinDate: new Date()
      }
    })
  }

  // ==================================================
  // MARKETING
  // ==================================================

  const marketingManager = await prisma.user.create({
    data: {
      name: "Sneha Iyer",
      email: "sneha.iyer@dummy.com",
      password: hashed,
      role: "MANAGER",
      companyId,
      departmentId: marketing.id
    }
  })

  await prisma.employee.create({
    data: {
      userId: marketingManager.id,
      name: "Sneha Iyer",
      email: "sneha.iyer@dummy.com",
      employeeCode: "MKT-MGR-001",
      position: "Marketing Manager",
      departmentId: marketing.id,
      companyId,
      joinDate: new Date()
    }
  })

  const marketingEmployees = [
    ["Varun Malhotra", "varun.malhotra@dummy.com"],
    ["Ritika Sen", "ritika.sen@dummy.com"],
    ["Kavita Rao", "kavita.rao@dummy.com"],
    ["Harsh Agarwal", "harsh.agarwal@dummy.com"],
    ["Divya Shah", "divya.shah@dummy.com"]
  ]

  for (const emp of marketingEmployees) {
    const user = await prisma.user.create({
      data: {
        name: emp[0],
        email: emp[1],
        password: hashed,
        role: "USER",
        companyId,
        departmentId: marketing.id
      }
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        name: emp[0],
        email: emp[1],
        employeeCode: `MKT-EMP-${emp[0].split(" ")[0]}`,
        position: "Marketing Executive",
        departmentId: marketing.id,
        companyId,
        joinDate: new Date()
      }
    })
  }

  // ==================================================
  // DEVELOPERS
  // ==================================================

  const devManager = await prisma.user.create({
    data: {
      name: "Aditya Rao",
      email: "aditya.rao@dummy.com",
      password: hashed,
      role: "MANAGER",
      companyId,
      departmentId: developers.id
    }
  })

  await prisma.employee.create({
    data: {
      userId: devManager.id,
      name: "Aditya Rao",
      email: "aditya.rao@dummy.com",
      employeeCode: "DEV-MGR-001",
      position: "Engineering Manager",
      departmentId: developers.id,
      companyId,
      joinDate: new Date()
    }
  })

  const devEmployees = [
    ["Nikhil Jain", "nikhil.jain@dummy.com"],
    ["Tanvi Gupta", "tanvi.gupta@dummy.com"],
    ["Abhishek Roy", "abhishek.roy@dummy.com"],
    ["Meera Pillai", "meera.pillai@dummy.com"],
    ["Siddharth Bose", "siddharth.bose@dummy.com"]
  ]

  for (const emp of devEmployees) {
    const user = await prisma.user.create({
      data: {
        name: emp[0],
        email: emp[1],
        password: hashed,
        role: "USER",
        companyId,
        departmentId: developers.id
      }
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        name: emp[0],
        email: emp[1],
        employeeCode: `DEV-EMP-${emp[0].split(" ")[0]}`,
        position: "Software Developer",
        departmentId: developers.id,
        companyId,
        joinDate: new Date()
      }
    })
  }

  console.log("Human data loaded successfully.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())