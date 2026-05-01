import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as calendarService from "../../service/calendarService";
import { ServiceError } from "../../service/userService";
import { EventType, Major, AcademicYear } from "@prisma/client";

// GET /api/admin/calendar
export async function listEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const { type, major, year, startDate, endDate, page, limit } = req.query;

    const result = await calendarService.listEvents({
      type: type as EventType | undefined,
      major: major as Major | undefined,
      year: year as AcademicYear | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/calendar/:id
export async function getEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const event = await calendarService.getEventById(req.params.id as string);
    return res.json(event);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/calendar
export async function createEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, type, startDate, endDate, major, year } = req.body;

    if (!title || !type || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "title, type, startDate, and endDate are required." });
    }

    const event = await calendarService.createEvent({
      title,
      description,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      major,
      year,
      createdBy: req.user.id,
    });

    return res.status(201).json(event);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/admin/calendar/:id
export async function updateEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, type, startDate, endDate, major, year } = req.body;

    const event = await calendarService.updateEvent(req.params.id as string, {
      title,
      description,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      major,
      year,
    });

    return res.json(event);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/calendar/:id
export async function deleteEvent(req: AuthenticatedRequest, res: Response) {
  try {
    await calendarService.removeEvent(req.params.id as string);
    return res.json({ message: "Event deleted." });
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error("Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}
