import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as calendarService from "../../service/calendarService";
import * as teacherService from "../../service/teacherService";
import { ServiceError } from "../../service/userService";

export async function getMyEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    const events = await calendarService.listEvents({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return res.json(events);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function saveEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { date, title, description } = req.body;
    
    if (req.user.role !== "TEACHER") {
      return res.status(403).json({ message: "Only teachers can add or update notes." });
    }

    // Must use Teacher ID, not User ID
    const teacher = await teacherService.getTeacherByUserId(req.user.id);

    const event = await calendarService.upsertEvent({
      date,
      title,
      description,
      teacherId: teacher.id,
    });

    return res.json({ success: true, data: event });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
    if (req.user.role !== "TEACHER") {
      return res.status(403).json({ message: "Only teachers can delete notes." });
    }
    await calendarService.removeEvent(id);
    return res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error("Calendar API Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}
