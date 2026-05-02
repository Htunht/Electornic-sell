import prisma from "../lib/prisma";
import { Major, AcademicYear, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findSubjectById(id: string) {
  return prisma.subject.findUnique({ where: { id } });
}

export async function findSubjectByCode(code: string) {
  return prisma.subject.findUnique({ where: { code } });
}

export async function findAllSubjects(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 50, search } = params ?? {};

  const where: Prisma.SubjectWhereInput = {};
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { code: "asc" },
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    subjects,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findSubjectsByMajor(major: Major) {
  return prisma.subject.findMany({
    where: { major },
    orderBy: { year: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createSubject(data: {
  code: string;
  name: string;
  major: Major;
  year: AcademicYear;
}) {
  return prisma.subject.create({ data });
}

export async function updateSubject(
  id: string,
  data: Prisma.SubjectUpdateInput,
) {
  return prisma.subject.update({ where: { id }, data });
}

export async function deleteSubject(id: string) {
  return prisma.subject.delete({ where: { id } });
}
