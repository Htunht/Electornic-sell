import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Find or Create the Student User
  const studentUser = await prisma.user.upsert({
    where: { email: "student@example.com" }, 
    update: {},
    create: {
      name: "Test Student",
      email: "student@example.com",
      role: "STUDENT",
      emailVerified: true,
    },
  });

  // 2. Create the Student Profile
  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      rollNo: "S-001",
      name: "Test Student",
      year: "YEAR_6", 
      major: "IT",
      phone: "09123456789",
    },
  });

  // 3. Find or Create the Teacher User
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      name: "Test Teacher",
      email: "teacher@example.com",
      role: "TEACHER",
      emailVerified: true,
    },
  });

  // 4. Create the Teacher Profile
  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      name: "Test Teacher",
      phone: "09987654321",
      majorHead: "IT", 
    },
  });

  console.log("✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
