import prisma from "../lib/prisma";
import { Major, AcademicYear, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function findStudentByUserId(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    include: { user: true },
  });
}

export async function findStudentByRollNo(rollNo: string) {
  return prisma.student.findUnique({
    where: { rollNo },
    include: { user: true },
  });
}

export async function findAllStudents(params?: {
  major?: Major;
  year?: AcademicYear;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { major, year, page = 1, limit = 20, search } = params ?? {};

  const where: Prisma.StudentWhereInput = {};
  if (major) where.major = major;
  if (year) where.year = year;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { rollNo: { contains: search, mode: "insensitive" } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { user: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { rollNo: "asc" },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createStudent(data: {
  userId: string;
  rollNo: string;
  name: string;
  major: Major;
  year: AcademicYear;
  phone?: string;
  birthDate?: Date;
}) {
  return prisma.student.create({ data, include: { user: true } });
}

export async function updateStudent(
  id: string,
  data: Prisma.StudentUpdateInput,
) {
  return prisma.student.update({
    where: { id },
    data,
    include: { user: true },
  });
}

export async function deleteStudent(id: string) {
  return prisma.student.delete({ where: { id } });
}

/**
 * Bulk-create students in a single transaction (for CSV imports).
 */
export async function createManyStudents(
  records: {
    userId: string;
    rollNo: string;
    name: string;
    major: Major;
    year: AcademicYear;
    phone?: string;
  }[],
) {
  return prisma.student.createMany({ data: records, skipDuplicates: true });
}
