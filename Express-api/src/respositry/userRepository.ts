import prisma from "../lib/prisma";
import { Role, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { studentProfile: true, teacherProfile: true },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { studentProfile: true, teacherProfile: true },
  });
}

export async function findAllUsers(params?: {
  role?: Role;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { role, page = 1, limit = 20, search } = params ?? {};

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { studentProfile: true, teacherProfile: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createUser(data: {
  email: string;
  password?: string;
  role?: Role;
}) {
  return prisma.user.create({ data });
}

export async function updateUserRole(id: string, role: Role) {
  return prisma.user.update({ where: { id }, data: { role } });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
