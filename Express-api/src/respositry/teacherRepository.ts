import prisma from "../lib/prisma";
import { Major, Prisma } from "@prisma/client";
import { calculateGrade } from "../service/resultService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findTeacherById(id: string) {
  return prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,
      questionPapers: true,
      results: true,
    },
  });
}

export async function findTeacherByUserId(userId: string) {
  return prisma.teacher.findUnique({
    where: { userId },
    include: { user: true, questionPapers: true, results: true },
  });
}

export async function findAllTeachers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 20, search } = params ?? {};

  const where: Prisma.TeacherWhereInput = {};
  if (search) {
    where.user = { name: { contains: search, mode: "insensitive" } };
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: { user: true, questionPapers: true, results: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { user: { name: "asc" } },
    }),
    prisma.teacher.count({ where }),
  ]);

  return {
    teachers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Find the Major Head for a given major */
export async function findMajorHead(major: Major) {
  return prisma.teacher.findFirst({
    where: { major: major as Major },
    include: { user: true },
  });
}

/** Find all Minor Heads */
export async function findMinorHeads() {
  return prisma.teacher.findMany({
    where: {}, // All teachers
    include: { user: true },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createTeacher(data: {
  userId: string;
  name: string;
  phone?: string;
  major: Major;
}) {
  return prisma.teacher.create({
    data: { userId: data.userId, major: data.major },
    include: { user: true },
  });
}

export async function updateTeacher(
  id: string,
  data: Prisma.TeacherUpdateInput,
) {
  return prisma.teacher.update({
    where: { id },
    data,
    include: { user: true },
  });
}

export async function deleteTeacher(id: string) {
  return prisma.teacher.delete({ where: { id } });
}
// express-api/src/respositry/teacherRepository.ts

/** Classes Tab မှ ဘာသာရပ်အလိုက် ကျောင်းခေါ်ချိန်ကို အစုလိုက်သိမ်းရန် */
export async function bulkUpdateAttendance(subjectId: string, data: any[]) {
  return prisma.$transaction(
    data.map((item) =>
      prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: item.studentId,
            subjectId: subjectId,
            date: item.date,
          },
        },
        update: { status: item.status },
        create: {
          studentId: item.studentId,
          subjectId: subjectId,
          status: item.status,
          date: item.date,
        },
      }),
    ),
  );
}

/** Students Tab မှ ကျောင်းသားတစ်ဦးချင်းစီအတွက် အမှတ်ကို သိမ်းရန် */
export async function upsertStudentMarks(
  studentId: string,
  subjectId: string,
  marks: number,
  teacherId: string,
) {
  // Fetch student and subject for denormalized fields (major, year)
  const [student, subject] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.subject.findUnique({ where: { id: subjectId } }),
  ]);

  if (!student || !subject) {
    throw new Error("Student or Subject not found.");
  }

  const { grade } = calculateGrade(marks);

  return prisma.result.upsert({
    where: {
      studentId_subjectId: {
        studentId: studentId,
        subjectId: subjectId,
      },
    },
    update: {
      marks: marks,
      grade: grade,
      teacherId: teacherId,
    },
    create: {
      studentId: studentId,
      subjectId: subjectId,
      marks: marks,
      grade: grade,
      teacherId: teacherId,
      major: student.major,
      year: student.year,
    },
  });
}
