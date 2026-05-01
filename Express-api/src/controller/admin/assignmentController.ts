import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as assignmentService from "../../service/assignmentService";
import { ServiceError } from "../../service/userService";
import { Major, AcademicYear } from "@prisma/client";

// GET /api/admin/assignments/teacher/:teacherId
export async function getTeacherAssignments(req: AuthenticatedRequest, res: Response) {
  try {
    const assignments = await assignmentService.getTeacherAssignments(req.params.teacherId as string);
    return res.json(assignments);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/assignments/class
export async function getClassAssignments(req: AuthenticatedRequest, res: Response) {
  try {
    const { major, year } = req.query;

    if (!major || !year) {
      return res.status(400).json({ message: "major and year query params are required." });
    }

    const assignments = await assignmentService.getClassAssignments(
      major as Major,
      year as AcademicYear,
    );
    return res.json(assignments);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/assignments
export async function createAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    const { teacherId, subjectId, major, year, canEdit } = req.body;

    if (!teacherId || !subjectId || !major || !year) {
      return res
        .status(400)
        .json({ message: "teacherId, subjectId, major, and year are required." });
    }

    const assignment = await assignmentService.assignTeacher({
      teacherId,
      subjectId,
      major,
      year,
      canEdit,
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/admin/assignments/:id/toggle
export async function toggleEditPermission(req: AuthenticatedRequest, res: Response) {
  try {
    const { canEdit } = req.body;

    if (typeof canEdit !== "boolean") {
      return res.status(400).json({ message: "canEdit (boolean) is required." });
    }

    const assignment = await assignmentService.toggleEditPermission(req.params.id as string, canEdit);
    return res.json(assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/assignments/:id
export async function deleteAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    await assignmentService.removeAssignment(req.params.id as string);
    return res.json({ message: "Assignment removed." });
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
