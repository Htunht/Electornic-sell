import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";

export async function findEventById(id: string) {
  return await prisma.calendarEvent.findUnique({ where: { id } });
}

export async function findEvents(params?: { start?: string; end?: string }) {
  const where: Prisma.CalendarEventWhereInput = {};
  
  if (params?.start && params?.end) {
    const startDate = new Date(params.start);
    const endDate = new Date(params.end);
    
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return {
    events,
    total: events.length,
  };
}

export async function upsertEvent(data: {
  date: string;
  title: string;
  description?: string;
  teacherId?: string;
  headTeacherId?: string;
}) {
  const eventDate = new Date(data.date);
  // Reset to start of day (UTC) for consistency
  eventDate.setUTCHours(0, 0, 0, 0);

  return await prisma.calendarEvent.upsert({
    where: { date: eventDate },
    update: {
      title: data.title,
      description: data.description,
      teacherId: data.teacherId,
      headTeacherId: data.headTeacherId,
    },
    create: {
      date: eventDate,
      title: data.title,
      description: data.description,
      teacherId: data.teacherId,
      headTeacherId: data.headTeacherId,
    },
  });
}

export async function deleteEvent(id: string) {
  return await prisma.calendarEvent.delete({ where: { id } });
}
