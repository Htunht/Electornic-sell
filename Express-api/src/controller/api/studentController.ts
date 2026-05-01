import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as studentService from "../../service/studentService";
import * as resultService from "../../service/resultService";
import { ServiceError } from "../../service/userService";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    let student;
    try {
      student = await studentService.getStudentByUserId(req.user.id);
    } catch (err: any) {
      if (err instanceof ServiceError && err.status === 404) {
        console.log(`[AUTO-PROFILE] Creating student profile for user ${req.user.email}`);
        student = await studentService.createStudent({
          userId: req.user.id,
          rollNo: `S-${Math.floor(Math.random() * 10000)}`, // Default roll no
          name: req.user.email.split("@")[0],
          major: "IT", // Default major
          year: "YEAR_1", // Default year
        });
      } else {
        throw err;
      }
    }
    console.log(`[STUDENT API] Success: Returned profile for ${req.user.email}`);
    return res.json(student);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyResults(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await studentService.getStudentByUserId(req.user.id);
    const { academicYear } = req.query;

    const results = await resultService.getStudentResults(
      student.id,
      academicYear as string | undefined,
    );
    return res.json(results);
  } catch (error) {
    return handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  if (error instanceof ServiceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error("Student API Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}
