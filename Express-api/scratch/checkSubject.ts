import prisma from "../src/lib/prisma";
async function main() {
  const subjects = await prisma.subject.findMany();
  console.log(subjects);
}
main().catch(console.error).finally(() => prisma.$disconnect());
