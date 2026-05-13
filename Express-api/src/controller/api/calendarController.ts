import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as calendarService from "../../service/calendarService";
import * as headTeacherService from "../../service/headTeacherService";
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

    let teacherId: string | undefined;
    let headTeacherId: string | undefined;

    if (req.user.role === "HEAD_TEACHER") {
      const ht = await headTeacherService.getHeadTeacherByUserId(req.user.id);
      headTeacherId = ht.id;
    } else {
      const t = await teacherService.getTeacherByUserId(req.user.id);
      teacherId = t.id;
    }

    const event = await calendarService.upsertEvent({
      date,
      title,
      description,
      teacherId,
      headTeacherId,
    });

    return res.json({ success: true, data: event });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const id = req.params.id as string;
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
