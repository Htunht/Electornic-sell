import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as resultService from "../../service/resultService";
import { ServiceError } from "../../service/userService";
import { Major, AcademicYear } from "@prisma/client";

// GET /api/admin/results
export async function listResults(req: AuthenticatedRequest, res: Response) {
  try {
    const { subjectId, major, year, page, limit } = req.query;

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId query param is required." });
    }

    const result = await resultService.getClassResults({
      subjectId: subjectId as string,
      major: major as Major | undefined,
      year: year as AcademicYear | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/results/pending/:major
export async function getPendingResults(req: AuthenticatedRequest, res: Response) {
  try {
    const results = await resultService.getPendingResults(req.params.major as Major);
    return res.json(results);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/results/student/:studentId
export async function getStudentResults(req: AuthenticatedRequest, res: Response) {
  try {
    const { major, year } = req.query;
    const results = await resultService.getStudentResults(
      req.params.studentId as string,
      major as Major | undefined,
      year as AcademicYear | undefined,
    );
    return res.json(results);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/results/:id/approve
export async function approveResult(req: AuthenticatedRequest, res: Response) {
  try {
    return res.status(410).json({ message: "Result approval is disabled in current schema." });
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/results/bulk-approve
export async function bulkApproveResults(req: AuthenticatedRequest, res: Response) {
  try {
    return res.status(410).json({ message: "Result approval is disabled in current schema." });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/results/:id
export async function deleteResult(req: AuthenticatedRequest, res: Response) {
  try {
    await resultService.removeResult(req.params.id as string);
    return res.json({ message: "Result deleted." });
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
