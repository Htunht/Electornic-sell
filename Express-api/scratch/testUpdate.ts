import { updateSubject } from "../src/respositry/subjectRepository";
import prisma from "../src/lib/prisma";

async function main() {
  const subjects = await prisma.subject.findMany();
  if (subjects.length > 0) {
    const id = subjects[0].id;
    console.log("Updating", id);
    try {
      const updated = await updateSubject(id, { name: subjects[0].name + " Updated" });
      console.log("Updated", updated);
    } catch (e) {
      console.error("Update failed", e);
    }
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
