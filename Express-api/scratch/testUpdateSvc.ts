import { updateSubject } from "../src/service/subjectService";
import prisma from "../src/lib/prisma";

async function main() {
  const subjects = await prisma.subject.findMany();
  if (subjects.length > 0) {
    const id = subjects[0].id;
    const code = subjects[0].code;
    console.log("Updating", id, "with code", code);
    try {
      const updated = await updateSubject(id, { code, name: subjects[0].name + " X", year: "YEAR_3" });
      console.log("Updated", updated);
    } catch (e) {
      console.error("Update failed", e);
    }
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
