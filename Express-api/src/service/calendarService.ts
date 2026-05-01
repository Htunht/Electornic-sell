import { EventType, Major, AcademicYear } from "@prisma/client";
import * as calendarRepo from "../respositry/calendarRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getEventById(id: string) {
  const event = await calendarRepo.findEventById(id);
  if (!event) throw new ServiceError(404, "Calendar event not found.");
  return event;
}

export async function listEvents(params?: {
  type?: EventType;
  major?: Major | null;
  year?: AcademicYear;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  return calendarRepo.findEvents(params);
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
  if (new Date(data.endDate) < new Date(data.startDate)) {
    throw new ServiceError(400, "End date must be after start date.");
  }
  return calendarRepo.createEvent(data);
}

export async function updateEvent(
  id: string,
  data: {
    title?: string;
    description?: string;
    type?: EventType;
    startDate?: Date;
    endDate?: Date;
    major?: Major | null;
    year?: AcademicYear | null;
  },
) {
  await getEventById(id);
  return calendarRepo.updateEvent(id, data);
}

export async function removeEvent(id: string) {
  await getEventById(id);
  return calendarRepo.deleteEvent(id);
}
