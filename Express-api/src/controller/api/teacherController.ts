import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as teacherService from "../../service/teacherService";
import * as subjectService from "../../service/subjectService";
import * as studentService from "../../service/studentService";
import * as resultService from "../../service/resultService";
import * as attendanceService from "../../service/attendanceService";
import * as assignmentService from "../../service/assignmentService";
import { ServiceError } from "../../service/userService";
import { AcademicYear, AttendanceStatus } from "@prisma/client";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    let teacher;
    try {
      teacher = await teacherService.getTeacherByUserId(req.user.id);
    } catch (err: any) {
      if (err instanceof ServiceError && err.status === 404) {
        console.log(
          `[AUTO-PROFILE] Creating teacher profile for user ${req.user.email}`,
        );
        teacher = await teacherService.createTeacher({
          userId: req.user.id,
          name: (req.user.name || req.user.email.split("@")[0]) as string,
          major: "IT", // Default
        });
      } else {
        throw err;
      }
    }
    console.log(
      `[TEACHER API] Success: Returned profile for ${req.user.email}`,
    );
    return res.json(teacher);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyAssignments(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const assignments = await assignmentService.getTeacherAssignments(teacher.id);

    const grouped = assignments.reduce(
      (acc, a: any) => {
        const year = String(a.year) as AcademicYear;
        if (!acc[year]) acc[year] = [];
        acc[year].push(a);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return res.json({
      teacherId: teacher.id,
      major: teacher.major,
      byYear: grouped,
      assignments,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMySubjects(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { year } = req.query;

    const subjects = await subjectService.getSubjectsByMajor(teacher.major);
    const filtered = year
      ? subjects.filter((s: any) => String(s.year) === String(year))
      : subjects;

    return res.json(filtered);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createMyAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { subjectId, year, canEdit } = req.body as {
      subjectId: string;
      year: AcademicYear;
      canEdit?: boolean;
    };

    if (!subjectId || !year) {
      return res.status(400).json({ message: "subjectId and year are required." });
    }

    const subject = await subjectService.getSubjectById(subjectId);
    if (subject.major !== teacher.major) {
      return res.status(403).json({ message: "Forbidden: subject is outside your major." });
    }
    if (String(subject.year) !== String(year)) {
      return res.status(400).json({ message: "year must match the subject.year." });
    }

    const assignment = await assignmentService.assignTeacher({
      teacherId: teacher.id,
      subjectId,
      major: teacher.major,
      year,
      canEdit,
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteMyAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { id } = req.params as { id: string };

    const assignment = await assignmentService.getAssignmentById(id);
    if (assignment.teacherId !== teacher.id) {
      return res.status(403).json({ message: "Forbidden: cannot delete another teacher's assignment." });
    }

    await assignmentService.removeAssignment(id);
    return res.json({ message: "Assignment removed." });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyStudents(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { year, search, page, limit } = req.query;

    const result = await studentService.listStudents({
      major: teacher.major,
      year: year ? (year as AcademicYear) : undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function bulkUpsertResults(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { subjectId, year, records, semester, academicYear } = req.body as {
      subjectId: string;
      year: AcademicYear;
      semester?: number;
      academicYear?: string;
      records: { studentId: string; marks: number }[];
    };

    if (!subjectId || !year || !Array.isArray(records)) {
      return res
        .status(400)
        .json({ message: "subjectId, year, and records are required." });
    }

    const result = await resultService.bulkUpsertResults(
      teacher.id,
      subjectId,
      teacher.major,
      year,
      records,
      {
        semester,
        academicYear,
      },
    );
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function bulkUpsertAttendance(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { subjectId, year, date, records } = req.body as {
      subjectId: string;
      year: AcademicYear;
      date: string;
      records: { studentId: string; status: AttendanceStatus }[];
    };

    if (!subjectId || !year || !date || !Array.isArray(records)) {
      return res
        .status(400)
        .json({ message: "subjectId, year, date, and records are required." });
    }

    const dt = new Date(date);
    const data = records.map((r) => ({
      studentId: r.studentId,
      date: dt,
      status: r.status,
      subjectId,
      teacherId: teacher.id,
      major: teacher.major,
      year,
    }));

    const result = await attendanceService.bulkUpsertAttendance(data);
    return res.json(result);
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
