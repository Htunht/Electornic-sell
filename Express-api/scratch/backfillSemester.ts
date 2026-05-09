import prisma from "../src/lib/prisma";
async function main() {
  const all = await prisma.subject.findMany();
  console.log("Total subjects:", all.length);
  all.forEach(s => console.log(`  ${s.code}: semester=${s.semester}`));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
