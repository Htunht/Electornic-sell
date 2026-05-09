import prisma from "../src/lib/prisma";
async function main() {
  const subj = await prisma.subject.create({data: {code: "TEST-01", name: "Test", major: "IT", year: "YEAR_1"}});
  console.log("Created:", subj);
  const updated = await prisma.subject.update({where: {id: subj.id}, data: {name: "Updated Test"}});
  console.log("Updated:", updated);
  const deleted = await prisma.subject.delete({where: {id: subj.id}});
  console.log("Deleted:", deleted);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
