import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as calendarService from "../../service/calendarService";
import { ServiceError } from "../../service/userService";

import * as teacherService from "../../service/teacherService";

// GET /api/admin/calendar
export async function listEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const result = await calendarService.listEvents({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
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

// POST /api/admin/calendar (Upsert based on date)
export async function createEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { date, title, description } = req.body;

    if (!date || !title) {
      return res
        .status(400)
        .json({ message: "date and title are required." });
    }

    const teacher = await teacherService.getTeacherByUserId(req.user.id);

    const event = await calendarService.upsertEvent({
      date,
      title,
      description,
      teacherId: teacher.id,
    });

    return res.status(201).json(event);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/admin/calendar/:id (In simplified model, we usually use POST/Upsert, but keeping for compatibility)
export async function updateEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { date, title, description } = req.body;

    const event = await calendarService.upsertEvent({
      date,
      title,
      description,
      teacherId: req.user.id,
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
