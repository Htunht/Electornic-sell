import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as studentService from "../../service/studentService";
import { ServiceError } from "../../service/userService";
import { Major, AcademicYear } from "@prisma/client";

// GET /api/admin/students
export async function listStudents(req: AuthenticatedRequest, res: Response) {
  try {
    const { major, year, page, limit, search } = req.query;

    const result = await studentService.listStudents({
      major: major as Major | undefined,
      year: year as AcademicYear | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/admin/students/:id
export async function getStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await studentService.getStudentById(req.params.id as string);
    return res.json(student);
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/admin/students
export async function createStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, rollNo, name, major, year, phone, birthDate } = req.body;

    if (!userId || !rollNo || !name || !major || !year) {
      return res
        .status(400)
        .json({ message: "userId, rollNo, name, major, and year are required." });
    }

    const student = await studentService.createStudent({
      userId,
      rollNo,
      name,
      major,
      year,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    });

    return res.status(201).json(student);
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/admin/students/:id
export async function updateStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, major, year, phone, birthDate } = req.body;

    const student = await studentService.updateStudent(req.params.id as string, {
      name,
      major,
      year,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    });

    return res.json(student);
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/admin/students/:id
export async function deleteStudent(req: AuthenticatedRequest, res: Response) {
  try {
    await studentService.removeStudent(req.params.id as string);
    return res.json({ message: "Student deleted." });
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
