import prisma from "../lib/prisma";
import { AttendanceStatus, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findAttendanceByStudent(
  studentId: string,
  params?: { startDate?: Date; endDate?: Date; subjectId?: string },
) {
  const where: Prisma.AttendanceWhereInput = { studentId };
  if (params?.subjectId) where.subjectId = params.subjectId;
  if (params?.startDate || params?.endDate) {
    where.date = {};
    if (params.startDate) where.date.gte = params.startDate;
    if (params.endDate) where.date.lte = params.endDate;
  }

  return prisma.attendance.findMany({
    where,
    include: { subject: true },
    orderBy: { date: "desc" },
  });
}

export async function findAttendanceByDate(
  date: Date,
  params?: { subjectId?: string },
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const where: Prisma.AttendanceWhereInput = {
    date: { gte: startOfDay, lte: endOfDay },
  };
  if (params?.subjectId) where.subjectId = params.subjectId;

  return prisma.attendance.findMany({
    where,
    include: { student: true },
    orderBy: { student: { rollNo: "asc" } },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createAttendance(data: {
  studentId: string;
  date?: Date;
  status: AttendanceStatus;
  subjectId: string;
}) {
  return prisma.attendance.create({ data });
}

/** Bulk-mark attendance for an entire class */
export async function createManyAttendance(
  records: {
    studentId: string;
    date: Date;
    status: AttendanceStatus;
    subjectId: string;
  }[],
) {
  return prisma.attendance.createMany({ data: records });
}

export async function upsertManyAttendance(
  records: {
    studentId: string;
    date: Date;
    status: AttendanceStatus;
    subjectId: string;
    teacherId?: string;
    major?: any;
    year?: any;
  }[],
) {
  const ops = records.map((r) =>
    prisma.attendance.upsert({
      where: {
        studentId_date_subjectId: {
          studentId: r.studentId,
          date: r.date,
          subjectId: r.subjectId,
        },
      },
      create: {
        studentId: r.studentId,
        date: r.date,
        status: r.status,
        subjectId: r.subjectId,
        teacherId: r.teacherId ?? null,
        major: r.major ?? null,
        year: r.year ?? null,
      },
      update: {
        status: r.status,
        teacherId: r.teacherId ?? null,
        major: r.major ?? null,
        year: r.year ?? null,
      },
    }),
  );

  return prisma.$transaction(ops);
}

export async function updateAttendance(
  id: string,
  status: AttendanceStatus,
) {
  return prisma.attendance.update({ where: { id }, data: { status } });
}

export async function deleteAttendance(id: string) {
  return prisma.attendance.delete({ where: { id } });
}
