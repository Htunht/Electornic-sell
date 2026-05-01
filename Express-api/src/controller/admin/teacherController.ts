import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as teacherService from "../../service/teacherService";
import { ServiceError } from "../../service/userService";
import { Major } from "@prisma/client";

// GET /api/admin/teachers
export async function listTeachers(req: AuthenticatedRequest, res: Response) {
  try {
    const { page, limit, search } = req.query;

    const result = await teacherService.listTeachers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/teachers/:id
export async function getTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id as string);
    return res.json(teacher);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/teachers
export async function createTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, name, phone, majorHead, minorDept } = req.body;

    if (!userId || !name) {
      return res
        .status(400)
        .json({ message: "userId and name are required." });
    }

    const teacher = await teacherService.createTeacher({
      userId,
      name,
      phone,
      majorHead,
      minorDept,
    });

    return res.status(201).json(teacher);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/admin/teachers/:id
export async function updateTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, phone, majorHead, minorDept } = req.body;

    const teacher = await teacherService.updateTeacher(req.params.id as string, {
      name,
      phone,
      majorHead,
      minorDept,
    });

    return res.json(teacher);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/teachers/:id
export async function deleteTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    await teacherService.removeTeacher(req.params.id as string);
    return res.json({ message: "Teacher deleted." });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/teachers/major-head/:major
export async function getMajorHead(req: AuthenticatedRequest, res: Response) {
  try {
    const head = await teacherService.getMajorHead(req.params.major as Major);
    if (!head) return res.status(404).json({ message: "No Major Head found." });
    return res.json(head);
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
