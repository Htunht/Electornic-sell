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

  // -------------------------------------------------------------------------
  // Teacher (login: teacher@example.com)
  // -------------------------------------------------------------------------
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: { role: "TEACHER", emailVerified: true, name: "Test Teacher" },
    create: {
      name: "Test Teacher",
      email: "teacher@example.com",
      role: "TEACHER",
      emailVerified: true,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: { major: "IT" },
    create: { userId: teacherUser.id, major: "IT" },
  });

  // -------------------------------------------------------------------------
  // Subjects (IT, YEAR_1..YEAR_6)
  // -------------------------------------------------------------------------
  const subjectSeeds = [
    { code: "IT-1101", name: "Programming Fundamentals", year: "YEAR_1" },
    { code: "IT-1102", name: "Discrete Mathematics", year: "YEAR_1" },
    { code: "IT-2101", name: "Data Structures", year: "YEAR_2" },
    { code: "IT-2102", name: "Computer Organization", year: "YEAR_2" },
    { code: "IT-3101", name: "Database Systems", year: "YEAR_3" },
    { code: "IT-3102", name: "Operating Systems", year: "YEAR_3" },
    { code: "IT-4101", name: "Software Engineering", year: "YEAR_4" },
    { code: "IT-4102", name: "Computer Networks", year: "YEAR_4" },
    { code: "IT-5101", name: "Web Development", year: "YEAR_5" },
    { code: "IT-5102", name: "Machine Learning", year: "YEAR_5" },
    { code: "IT-6101", name: "Cloud Computing", year: "YEAR_6" },
    { code: "IT-6102", name: "Information Security", year: "YEAR_6" },
  ] as const;

  const subjects = await Promise.all(
    subjectSeeds.map((s) =>
      prisma.subject.upsert({
        where: { code: s.code },
        update: { name: s.name, major: "IT", year: s.year },
        create: { code: s.code, name: s.name, major: "IT", year: s.year, creditHours: 3 },
      }),
    ),
  );

  // -------------------------------------------------------------------------
  // Students (few per year)
  // -------------------------------------------------------------------------
  const years = ["YEAR_1", "YEAR_2", "YEAR_3", "YEAR_4", "YEAR_5", "YEAR_6"] as const;
  for (const y of years) {
    for (let i = 1; i <= 4; i++) {
      const email = `student.${y.toLowerCase()}.${i}@example.com`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { role: "STUDENT", emailVerified: true, name: `Student ${y} ${i}` },
        create: {
          name: `Student ${y} ${i}`,
          email,
          role: "STUDENT",
          emailVerified: true,
        },
      });

      await prisma.student.upsert({
        where: { userId: user.id },
        update: {
          name: `Student ${y} ${i}`,
          major: "IT",
          year: y,
          phoneNumber: `09${String(100000000 + i).slice(0, 9)}`,
          address: "Yangon",
        },
        create: {
          userId: user.id,
          rollNo: `IT-${y.replace("YEAR_", "")}-${String(i).padStart(3, "0")}`,
          name: `Student ${y} ${i}`,
          major: "IT",
          year: y,
          phoneNumber: `09${String(100000000 + i).slice(0, 9)}`,
          address: "Yangon",
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Assignments (teacher takes 1-2 subjects per year)
  // -------------------------------------------------------------------------
  const byYear: Record<string, any[]> = {};
  for (const s of subjects) {
    const y = String(s.year);
    byYear[y] ||= [];
    byYear[y].push(s);
  }

  for (const y of years) {
    const list = byYear[String(y)] ?? [];
    for (const s of list.slice(0, 2)) {
      await prisma.subjectAssignment.upsert({
        where: {
          subjectId_major_year: { subjectId: s.id, major: "IT", year: y },
        },
        update: { teacherId: teacher.id, canEdit: true },
        create: {
          teacherId: teacher.id,
          subjectId: s.id,
          major: "IT",
          year: y,
          canEdit: true,
        },
      });
    }
  }

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
