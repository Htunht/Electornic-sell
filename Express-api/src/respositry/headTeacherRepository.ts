import prisma from "../lib/prisma";
import { Major, Prisma } from "@prisma/client";
import { calculateGrade } from "../service/resultService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findHeadTeacherById(id: string) {
  return prisma.headTeacher.findUnique({
    where: { id },
    include: {
      user: true,
      questionPapers: true,
      results: true,
    },
  });
}

export async function findHeadTeacherByUserId(userId: string) {
  return prisma.headTeacher.findUnique({
    where: { userId },
    include: { user: true, questionPapers: true, results: true },
  });
}

export async function findAllHeadTeachers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 20, search } = params ?? {};

  const where: Prisma.HeadTeacherWhereInput = {};
  if (search) {
    where.user = { name: { contains: search, mode: "insensitive" } };
  }

  const [headTeachers, total] = await Promise.all([
    prisma.headTeacher.findMany({
      where,
      include: { user: true, questionPapers: true, results: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { user: { name: "asc" } },
    }),
    prisma.headTeacher.count({ where }),
  ]);

  return {
    headTeachers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Find the Major Head (Head Teacher) for a given major */
export async function findMajorHead(major: Major) {
  return prisma.headTeacher.findFirst({
    where: { major: major as Major },
    include: { user: true },
  });
}

export async function findAllTeachersWithAssignments(major: Major) {
  return prisma.teacher.findMany({
    where: { 
      major,
      user: {
        role: {
          not: 'HEAD_TEACHER'
        }
      }
    },
    include: {
      user: true,
      assignments: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: {
      user: {
        name: 'asc'
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createHeadTeacher(data: {
  userId: string;
  major: Major;
}) {
  return prisma.headTeacher.create({
    data: { userId: data.userId, major: data.major },
    include: { user: true },
  });
}

export async function updateHeadTeacher(
  id: string,
  data: Prisma.HeadTeacherUpdateInput,
) {
  return prisma.headTeacher.update({
    where: { id },
    data,
    include: { user: true },
  });
}

export async function deleteHeadTeacher(id: string) {
  return prisma.headTeacher.delete({ where: { id } });
}

/** Bulk-update attendance records for a subject */
export async function bulkUpdateAttendance(subjectId: string, data: any[], headTeacherId: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  
  return prisma.$transaction(
    data.map((item) => {
      const dateObj = new Date(item.date);
      dateObj.setHours(0, 0, 0, 0);

      return prisma.attendance.upsert({
        where: {
          studentId_date_subjectId: {
            studentId: item.studentId,
            date: dateObj,
            subjectId: subjectId,
          },
        },
        update: { 
          status: item.status,
          headTeacherId: headTeacherId,
          teacherId: null, // Clear teacherId since a HeadTeacher is setting it
        },
        create: {
          studentId: item.studentId,
          subjectId: subjectId,
          status: item.status,
          date: dateObj,
          major: subject?.major,
          year: subject?.year,
          headTeacherId: headTeacherId,
        },
      });
    }),
  );
}

/** Upsert student marks for a subject */
export async function upsertStudentMarks(
  studentId: string,
  subjectId: string,
  marks: number,
  headTeacherId: string,
) {
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
      headTeacherId: headTeacherId,
      teacherId: null, // Clear teacherId since a HeadTeacher is setting it
      semester: subject.semester,
    },
    create: {
      studentId: studentId,
      subjectId: subjectId,
      marks: marks,
      grade: grade,
      headTeacherId: headTeacherId,
      major: student.major,
      year: student.year,
      semester: subject.semester,
    },
  });
}
