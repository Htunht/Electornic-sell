import { Major, AcademicYear } from "@prisma/client";
import * as calendarRepo from "../respositry/calendarRepository";
import { ServiceError } from "./userService";

export async function getEventById(id: string) {
  const event = await calendarRepo.findEventById(id);
  if (!event) throw new ServiceError(404, "Calendar event not found.");
  return event;
}

export async function listEvents(params?: {
  startDate?: Date;
  endDate?: Date;
}) {
  return calendarRepo.findEvents({
    start: params?.startDate?.toISOString(),
    end: params?.endDate?.toISOString(),
  });
}

export async function upsertEvent(data: {
  date: string;
  title: string;
  description?: string;
  teacherId?: string;
  headTeacherId?: string;
}) {
  return calendarRepo.upsertEvent(data);
}

export async function removeEvent(id: string) {
  await getEventById(id);
  return calendarRepo.deleteEvent(id);
}
