import prisma from "../lib/prisma";
import { Major, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findTeacherById(id: string) {
  return prisma.teacher.findUnique({
    where: { id },
    include: { user: true, assignments: { include: { subject: true } } },
  });
}

export async function findTeacherByUserId(userId: string) {
  return prisma.teacher.findUnique({
    where: { userId },
    include: { user: true, assignments: { include: { subject: true } } },
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
    where.name = { contains: search, mode: "insensitive" };
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: { user: true, assignments: { include: { subject: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
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
    where: { majorHead: major },
    include: { user: true },
  });
}

/** Find all Minor Heads */
export async function findMinorHeads() {
  return prisma.teacher.findMany({
    where: { minorDept: { not: null } },
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
  majorHead?: Major;
  minorDept?: string;
}) {
  return prisma.teacher.create({ data, include: { user: true } });
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
