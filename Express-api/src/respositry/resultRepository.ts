import prisma from "../lib/prisma";
import { Major, AcademicYear, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

export async function findResultById(id: string) {
  return prisma.result.findUnique({
    where: { id },
    include: { student: true, subject: true },
  });
}

export async function findResultsByStudent(
  studentId: string,
  major?: Major,
  year?: AcademicYear,
) {
  const where: Prisma.ResultWhereInput = { studentId };
  if (major) where.major = major;
  if (year) where.year = year;

  return prisma.result.findMany({
    where,
    include: { subject: true, student: true },
    orderBy: { subject: { code: "asc" } },
  });
}

export async function findResultsBySubjectAndClass(params: {
  subjectId: string;
  major?: Major;
  year?: AcademicYear;
  page?: number;
  limit?: number;
}) {
  const {
    subjectId,
    major,
    year,
    page = 1,
    limit = 50,
  } = params;

  const where: Prisma.ResultWhereInput = { subjectId };
  if (major) where.major = major;
  if (year) where.year = year;

  const [results, total] = await Promise.all([
    prisma.result.findMany({
      where,
      include: { student: true, subject: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { student: { rollNo: "asc" } },
    }),
    prisma.result.count({ where }),
  ]);

  return {
    results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Disabled: status field removed from schema */
export async function findPendingResultsByMajor(major: Major) {
  void major;
  return [];
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createResult(data: {
  studentId: string;
  subjectId: string;
  teacherId: string;
  marks: number;
  grade: string;
  major: Major;
  year: AcademicYear;
}) {
  return prisma.result.create({
    data,
    include: { student: true, subject: true },
  });
}

/** Bulk-create results (teacher uploading a full class) */
export async function createManyResults(
  records: {
    studentId: string;
    subjectId: string;
    teacherId: string;
    marks: number;
    grade: string;
    major: Major;
    year: AcademicYear;
    semester?: number;
    academicYear?: string;
  }[],
) {
  return prisma.result.createMany({
    data: records,
    skipDuplicates: true,
  });
}

export async function upsertManyResults(params: {
  teacherId: string;
  subjectId: string;
  major: Major;
  year: AcademicYear;
  semester?: number;
  academicYear?: string;
  records: { studentId: string; marks: number; grade: string }[];
}) {
  const ops = params.records.map((r) =>
    prisma.result.upsert({
      where: {
        studentId_subjectId: {
          studentId: r.studentId,
          subjectId: params.subjectId,
        },
      },
      create: {
        studentId: r.studentId,
        subjectId: params.subjectId,
        teacherId: params.teacherId,
        marks: r.marks,
        grade: r.grade,
        major: params.major,
        year: params.year,
        semester: params.semester ?? 1,
        academicYear: params.academicYear ?? "2025-2026",
      },
      update: {
        teacherId: params.teacherId,
        marks: r.marks,
        grade: r.grade,
        major: params.major,
        year: params.year,
        semester: params.semester ?? 1,
        academicYear: params.academicYear ?? "2025-2026",
      },
      include: { student: true, subject: true },
    }),
  );

  return prisma.$transaction(ops);
}

export async function updateResult(
  id: string,
  data: Prisma.ResultUpdateInput,
) {
  return prisma.result.update({
    where: { id },
    data,
    include: { student: true, subject: true },
  });
}

/**
 * Disabled: `Result.status` was removed from the Prisma schema.
 * Keep this function only to avoid breaking older callers.
 */
export async function setResultStatus(
  id: string,
  status: string,
  approvedBy: string,
) {
  void id;
  void status;
  void approvedBy;
  throw new Error("Result status is not supported (field removed from Prisma schema).");
}

/**
 * Disabled: `Result.status` was removed from the Prisma schema.
 * Keep this function only to avoid breaking older callers.
 */
export async function bulkSetResultStatus(
  ids: string[],
  status: string,
) {
  void ids;
  void status;
  throw new Error("Result status is not supported (field removed from Prisma schema).");
}

export async function deleteResult(id: string) {
  return prisma.result.delete({ where: { id } });
}
