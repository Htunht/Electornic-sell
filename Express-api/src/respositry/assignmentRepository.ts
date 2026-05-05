import prisma from "../lib/prisma";
import { Major, AcademicYear } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findAssignmentById(id: string) {
  return prisma.subjectAssignment.findUnique({
    where: { id },
    include: { teacher: true, subject: true },
  });
}

export async function findAssignmentsByTeacher(teacherId: string) {
  return prisma.subjectAssignment.findMany({
    where: { teacherId },
    include: { subject: true },
    orderBy: [{ major: "asc" }, { year: "asc" }],
  });
}

export async function findAssignmentsByClass(major: Major, year: AcademicYear) {
  return prisma.subjectAssignment.findMany({
    where: { major, year },
    include: { teacher: true, subject: true },
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
    include: { teacher: true, subject: true },
  });
}

/** Check if a teacher is assigned to a specific subject+class combination */
export async function findTeacherAssignment(
  teacherId: string,
  subjectId: string,
  major: Major,
  year: AcademicYear,
) {
  return prisma.subjectAssignment.findUnique({
    where: {
      teacherId_subjectId_major_year: {
        teacherId,
        subjectId,
        major,
        year,
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createAssignment(data: {
  teacherId: string;
  subjectId: string;
  major: Major;
  year: AcademicYear;
  canEdit?: boolean;
}) {
  return prisma.subjectAssignment.create({
    data,
    include: { teacher: true, subject: true },
  });
}

export async function updateAssignment(
  id: string,
  data: { canEdit?: boolean; teacherId?: string },
) {
  return prisma.subjectAssignment.update({
    where: { id },
    data,
    include: { teacher: true, subject: true },
  });
}

export async function deleteAssignment(id: string) {
  return prisma.subjectAssignment.delete({ where: { id } });
}
