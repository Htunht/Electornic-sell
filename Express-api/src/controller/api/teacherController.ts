import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as teacherService from "../../service/teacherService";
import * as assignmentService from "../../service/assignmentService";
import { ServiceError } from "../../service/userService";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    let teacher;
    try {
      teacher = await teacherService.getTeacherByUserId(req.user.id);
    } catch (err: any) {
      if (err instanceof ServiceError && err.status === 404) {
        console.log(`[AUTO-PROFILE] Creating teacher profile for user ${req.user.email}`);
        teacher = await teacherService.createTeacher({
          userId: req.user.id,
          name: req.user.email.split("@")[0],
          majorHead: "IT", // Default
        });
      } else {
        throw err;
      }
    }
    console.log(`[TEACHER API] Success: Returned profile for ${req.user.email}`);
    return res.json(teacher);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyAssignments(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const assignments = await assignmentService.getTeacherAssignments(teacher.id);
    return res.json(assignments);
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error("Teacher API Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}
