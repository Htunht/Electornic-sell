import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as subjectService from "../../service/subjectService";
import { ServiceError } from "../../service/userService";

// GET /api/admin/subjects
export async function listSubjects(req: AuthenticatedRequest, res: Response) {
  try {
    const { page, limit, search } = req.query;

    const result = await subjectService.listSubjects({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/subjects/:id
export async function getSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const subject = await subjectService.getSubjectById(req.params.id as string);
    return res.json(subject);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/subjects
export async function createSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, name, major, year, creditHours } = req.body;

    if (!code || !name || !major || !year) {
      return res
        .status(400)
        .json({ message: "code, name, major, and year are required." });
    }

    const subject = await subjectService.createSubject({
      code,
      name,
      major,
      year,
      creditHours: creditHours ? Number(creditHours) : undefined,
    });

    return res.status(201).json(subject);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/admin/subjects/:id
export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, name, creditHours } = req.body;

    const subject = await subjectService.updateSubject(req.params.id as string, {
      code,
      name,
      creditHours: creditHours ? Number(creditHours) : undefined,
    });

    return res.json(subject);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/subjects/:id
export async function deleteSubject(req: AuthenticatedRequest, res: Response) {
  try {
    await subjectService.removeSubject(req.params.id as string);
    return res.json({ message: "Subject deleted." });
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
