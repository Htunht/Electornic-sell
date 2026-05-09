import prisma from "../src/lib/prisma";
async function main() {
  const asgn = await prisma.subjectAssignment.findUnique({where: {id: "cmotqar5z0000fgvcxo6dd4d2"}});
  console.log("Assignment:", asgn);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
