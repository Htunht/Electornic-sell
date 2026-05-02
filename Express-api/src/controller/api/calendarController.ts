import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as calendarService from "../../service/calendarService";
import * as studentService from "../../service/studentService";
import { ServiceError } from "../../service/userService";
import { Major, AcademicYear } from "@prisma/client";

export async function getMyEvents(req: AuthenticatedRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    
    // Determine the target audience constraints based on user role
    let targetMajor: Major | null | undefined = undefined;
    let targetYear: AcademicYear | undefined = undefined;

    if (req.user.role === "STUDENT") {
      try {
        const student = await studentService.getStudentByUserId(req.user.id);
        targetMajor = student.major;
        targetYear = student.year;
      } catch {
        // If profile isn't found, just fetch school-wide events
        targetMajor = null; 
      }
    }
    // Teachers might just see school-wide events or specific major events depending on their role, 
    // for now we can just return events if they don't have constraints.

    const events = await calendarService.listEvents({
      major: targetMajor,
      year: targetYear,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return res.json(events);
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
