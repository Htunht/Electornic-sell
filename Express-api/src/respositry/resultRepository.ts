import prisma from "../lib/prisma";
import { Major, AcademicYear, ResultStatus, Prisma } from "@prisma/client";

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
  academicYear?: string,
) {
  const where: Prisma.ResultWhereInput = { studentId };
  if (academicYear) where.academicYear = academicYear;

  return prisma.result.findMany({
    where,
    include: { subject: true },
    orderBy: [{ semester: "asc" }, { subject: { code: "asc" } }],
  });
}

export async function findResultsBySubjectAndClass(params: {
  subjectId: string;
  major?: Major;
  year?: AcademicYear;
  academicYear?: string;
  semester?: number;
  status?: ResultStatus;
  page?: number;
  limit?: number;
}) {
  const {
    subjectId,
    major,
    year,
    academicYear,
    semester,
    status,
    page = 1,
    limit = 50,
  } = params;

  const where: Prisma.ResultWhereInput = { subjectId };
  if (academicYear) where.academicYear = academicYear;
  if (semester) where.semester = semester;
  if (status) where.status = status;
  if (major || year) {
    where.student = {};
    if (major) (where.student as Prisma.StudentWhereInput).major = major;
    if (year) (where.student as Prisma.StudentWhereInput).year = year;
  }

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

/** Find all results pending approval for a specific major */
export async function findPendingResultsByMajor(major: Major) {
  return prisma.result.findMany({
    where: {
      status: "PENDING",
      student: { major },
    },
    include: { student: true, subject: true },
    orderBy: { createdAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createResult(data: {
  studentId: string;
  subjectId: string;
  marks: number;
  grade: string;
  gradePoint: number;
  semester: number;
  academicYear: string;
  uploadedBy: string;
}) {
  return prisma.result.create({
    data: { ...data, status: "PENDING" },
    include: { student: true, subject: true },
  });
}

/** Bulk-create results (teacher uploading a full class) */
export async function createManyResults(
  records: {
    studentId: string;
    subjectId: string;
    marks: number;
    grade: string;
    gradePoint: number;
    semester: number;
    academicYear: string;
    uploadedBy: string;
  }[],
) {
  return prisma.result.createMany({
    data: records.map((r) => ({ ...r, status: "PENDING" as ResultStatus })),
    skipDuplicates: true,
  });
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

/** Approve or reject a result (Major Head action) */
export async function setResultStatus(
  id: string,
  status: ResultStatus,
  approvedBy: string,
) {
  return prisma.result.update({
    where: { id },
    data: { status, approvedBy },
    include: { student: true, subject: true },
  });
}

/** Bulk approve/reject results */
export async function bulkSetResultStatus(
  ids: string[],
  status: ResultStatus,
  approvedBy: string,
) {
  return prisma.result.updateMany({
    where: { id: { in: ids } },
    data: { status, approvedBy },
  });
}

export async function deleteResult(id: string) {
  return prisma.result.delete({ where: { id } });
}
