import prisma from "../src/lib/prisma";
async function main() {
  const asgns = await prisma.subjectAssignment.findMany();
  console.log("Assignments:", asgns);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
