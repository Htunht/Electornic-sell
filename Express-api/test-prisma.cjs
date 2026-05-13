const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const data = await prisma.gradeSubmission.findMany({
      where: { status: 'PENDING', major: 'IT' },
      include: {
        teacher: { include: { user: true } },
        student: true,
        subject: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    console.log('SUCCESS:', data);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
