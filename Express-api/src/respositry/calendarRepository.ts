import prisma from "../lib/prisma";
import { EventType, Major, AcademicYear, Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function findEventById(id: string) {
  return prisma.calendarEvent.findUnique({ where: { id } });
}

export async function findEvents(params?: {
  type?: EventType;
  major?: Major | null; // null = school-wide only
  year?: AcademicYear;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const { type, major, year, startDate, endDate, page = 1, limit = 50 } =
    params ?? {};

  const where: Prisma.CalendarEventWhereInput = {};
  if (type) where.type = type;

  // If major is explicitly null → school-wide events; if a value → that major
  if (major === null) {
    where.major = null;
  } else if (major) {
    where.OR = [{ major }, { major: null }]; // include school-wide too
  }

  if (year) where.year = year;
  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) where.startDate.gte = startDate;
    if (endDate) where.startDate.lte = endDate;
  }

  const [events, total] = await Promise.all([
    prisma.calendarEvent.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "asc" },
    }),
    prisma.calendarEvent.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createEvent(data: {
  title: string;
  description?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  major?: Major;
  year?: AcademicYear;
  createdBy: string;
}) {
  return prisma.calendarEvent.create({ data });
}

export async function updateEvent(
  id: string,
  data: Prisma.CalendarEventUpdateInput,
) {
  return prisma.calendarEvent.update({ where: { id }, data });
}

export async function deleteEvent(id: string) {
  return prisma.calendarEvent.delete({ where: { id } });
}
