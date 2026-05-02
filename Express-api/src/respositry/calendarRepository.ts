import prisma from "../lib/prisma";
import { Major, AcademicYear, Prisma } from "@prisma/client";

// CalendarEvent model has been removed from schema.
// Functions are disabled to prevent TypeError.

export async function findEventById(id: string) {
  return null;
}

export async function findEvents(params?: any) {
  return {
    events: [],
    total: 0,
    page: params?.page || 1,
    limit: params?.limit || 50,
    totalPages: 0,
  };
}

export async function createEvent(data: any) {
  return null;
}

export async function updateEvent(
  id: string,
  data: any,
) {
  return null;
}

export async function deleteEvent(id: string) {
  return null;
}

