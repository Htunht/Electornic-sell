import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as attendanceService from "../../service/attendanceService";
import * as studentService from "../../service/studentService";
import { ServiceError } from "../../service/userService";

export async function getMyAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);
    const { startDate, endDate, subjectId } = req.query;

    const attendance = await attendanceService.getStudentAttendance(student.id, {
      subjectId: subjectId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return res.json(attendance);
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error("Attendance API Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}

