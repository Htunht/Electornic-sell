import prisma from "../src/lib/prisma";
async function main() {
  // Simulate exactly what getMySubjects does
  const subjects = await prisma.subject.findMany({
    where: { major: "IT" },
    orderBy: { year: "asc" },
  });
  console.log("API response sample:");
  console.log(JSON.stringify(subjects[0], null, 2));
  console.log("\nAll semesters:", subjects.map(s => ({ code: s.code, semester: s.semester })));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
