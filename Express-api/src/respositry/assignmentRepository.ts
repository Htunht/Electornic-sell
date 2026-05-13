import prisma from "../lib/prisma";
import { Major, AcademicYear } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findAssignmentById(id: string) {
  return prisma.subjectAssignment.findUnique({
    where: { id },
    include: { teacher: true, headTeacher: true, subject: true },
  });
}

export async function findAssignmentsByTeacher(teacherId: string) {
  return prisma.subjectAssignment.findMany({
    where: { teacherId },
    include: { subject: true },
    orderBy: [{ major: "asc" }, { year: "asc" }],
  });
}

export async function findAssignmentsByHeadTeacher(headTeacherId: string) {
  return prisma.subjectAssignment.findMany({
    where: { headTeacherId },
    include: { subject: true },
    orderBy: [{ major: "asc" }, { year: "asc" }],
  });
}

export async function findAssignmentsByClass(major: Major, year: AcademicYear) {
  return prisma.subjectAssignment.findMany({
    where: { major, year },
    include: { teacher: true, headTeacher: true, subject: true },
  });
}

/** Find assignment by class slot (subject+major+year) */
export async function findAssignmentBySubjectClass(
  subjectId: string,
  major: Major,
  year: AcademicYear,
) {
  return prisma.subjectAssignment.findUnique({
    where: {
      subjectId_major_year: {
        subjectId,
        major,
        year,
      },
    },
    include: { teacher: true, headTeacher: true, subject: true },
  });
}

/** Check if a teacher is assigned to a specific subject+class combination */
export async function findTeacherAssignment(
  teacherId: string,
  subjectId: string,
  major: Major,
  year: AcademicYear,
) {
  return prisma.subjectAssignment.findFirst({
    where: {
      teacherId,
      subjectId,
      major,
      year,
    },
  });
}

export async function findHeadTeacherAssignment(
  headTeacherId: string,
  subjectId: string,
  major: Major,
  year: AcademicYear,
) {
  return prisma.subjectAssignment.findFirst({
    where: {
      headTeacherId,
      subjectId,
      major,
      year,
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createAssignment(data: {
  teacherId?: string;
  headTeacherId?: string;
  subjectId: string;
  major: Major;
  year: AcademicYear;
  canEdit?: boolean;
}) {
  return prisma.subjectAssignment.create({
    data: {
      teacherId: data.teacherId || undefined,
      headTeacherId: data.headTeacherId || undefined,
      subjectId: data.subjectId,
      major: data.major,
      year: data.year,
      canEdit: data.canEdit ?? true,
    },
    include: { teacher: true, headTeacher: true, subject: true },
  });
}

export async function updateAssignment(
  id: string,
  data: { canEdit?: boolean; teacherId?: string; headTeacherId?: string },
) {
  return prisma.subjectAssignment.update({
    where: { id },
    data,
    include: { teacher: true, headTeacher: true, subject: true },
  });
}

export async function deleteAssignment(id: string) {
  return prisma.subjectAssignment.delete({ where: { id } });
}
