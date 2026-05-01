import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as subjectService from "../../service/subjectService";
import { ServiceError } from "../../service/userService";

// GET /api/admin/subjects
export async function listSubjects(req: AuthenticatedRequest, res: Response) {
  try {
    const { isMinor, page, limit, search } = req.query;

    const result = await subjectService.listSubjects({
      isMinor: isMinor !== undefined ? isMinor === "true" : undefined,
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
    const { code, name, isMinor, creditHours } = req.body;

    if (!code || !name) {
      return res
        .status(400)
        .json({ message: "code and name are required." });
    }

    const subject = await subjectService.createSubject({
      code,
      name,
      isMinor,
      creditHours,
    });

    return res.status(201).json(subject);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/admin/subjects/:id
export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, name, isMinor, creditHours } = req.body;

    const subject = await subjectService.updateSubject(req.params.id as string, {
      code,
      name,
      isMinor,
      creditHours,
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
