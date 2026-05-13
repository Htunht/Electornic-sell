import prisma from "../lib/prisma";
import { Major, AcademicYear, GradeSubmissionStatus, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findPendingByMajor(major: Major) {
  return prisma.gradeSubmission.findMany({
    where: { status: "PENDING", major },
    include: {
      teacher: { include: { user: true } },
      student: true,
      subject: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function findByTeacher(teacherId: string) {
  return prisma.gradeSubmission.findMany({
    where: { teacherId },
    include: { student: true, subject: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.gradeSubmission.findUnique({
    where: { id },
    include: {
      teacher: { include: { user: true } },
      student: true,
      subject: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function upsertMany(params: {
  teacherId: string;
  subjectId: string;
  major: Major;
  year: AcademicYear;
  semester?: number;
  academicYear?: string;
  records: { studentId: string; marks: number; grade: string }[];
}) {
  const ops = params.records.map((r) =>
    prisma.gradeSubmission.upsert({
      where: {
        teacherId_studentId_subjectId: {
          teacherId: params.teacherId,
          studentId: r.studentId,
          subjectId: params.subjectId,
        },
      },
      create: {
        teacherId: params.teacherId,
        studentId: r.studentId,
        subjectId: params.subjectId,
        marks: r.marks,
        grade: r.grade,
        major: params.major,
        year: params.year,
        semester: params.semester ?? 1,
        academicYear: params.academicYear ?? "2025-2026",
        status: "PENDING",
      },
      update: {
        marks: r.marks,
        grade: r.grade,
        status: "PENDING", // re-opens a previously rejected submission
        reviewedById: null,
        reviewedAt: null,
        reviewNote: null,
      },
      include: { student: true, subject: true },
    }),
  );
  return prisma.$transaction(ops);
}

export async function updateStatus(
  id: string,
  status: GradeSubmissionStatus,
  reviewedById: string,
  reviewNote?: string,
) {
  return prisma.gradeSubmission.update({
    where: { id },
    data: { status, reviewedById, reviewedAt: new Date(), reviewNote },
    include: { student: true, subject: true },
  });
}

export async function bulkUpdateStatus(
  ids: string[],
  status: GradeSubmissionStatus,
  reviewedById: string,
  reviewNote?: string,
) {
  return prisma.gradeSubmission.updateMany({
    where: { id: { in: ids } },
    data: { status, reviewedById, reviewedAt: new Date(), reviewNote },
  });
}
