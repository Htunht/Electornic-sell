import prisma from "../src/lib/prisma";
import fs from "fs";
async function main() {
  const subjects = await prisma.subject.findMany();
  const assignments = await prisma.subjectAssignment.findMany();
  fs.writeFileSync("db_dump.json", JSON.stringify({ subjects, assignments }, null, 2));
  console.log("Dumped to db_dump.json");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
