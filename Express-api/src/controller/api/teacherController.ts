import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as teacherService from "../../service/teacherService";
import * as subjectService from "../../service/subjectService";
import * as studentService from "../../service/studentService";
import * as attendanceService from "../../service/attendanceService";
import * as assignmentService from "../../service/assignmentService";
import * as gradeSubmissionService from "../../service/gradeSubmissionService";
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

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
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

    // Permission check: Faculty must be assigned to this subject
    const isAssigned = await assignmentService.isFacultyAssignedToSubject(req.user.id, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ 
        message: "Forbidden: You are not assigned to teach this subject." 
      });
    }

    // Grades go into GradeSubmission (PENDING) — not directly to Result.
    // A Head Teacher must approve before they count for the student.
    const result = await gradeSubmissionService.submitGrades(
      teacher.id,
      subjectId,
      teacher.major,
      year,
      records,
      { semester, academicYear },
    );
    return res.json({ submitted: result.length, message: "Grades submitted for head-teacher review." });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMySubmissions(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const submissions = await gradeSubmissionService.getTeacherSubmissions(teacher.id);
    return res.json(submissions);
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

    // Permission check: Faculty must be assigned to this subject
    const isAssigned = await assignmentService.isFacultyAssignedToSubject(req.user.id, subjectId);
    if (!isAssigned) {
      return res.status(403).json({ 
        message: "Forbidden: You are not assigned to teach this subject." 
      });
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

export async function createSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const { code, name, year, semester, creditHours } = req.body;

    if (!code || !name || !year) {
      return res
        .status(400)
        .json({ message: "code, name, and year are required." });
    }

    const subject = await subjectService.createSubject({
      code,
      name,
      major: teacher.major,
      year,
      semester: semester ? Number(semester) : 1,
      creditHours: creditHours ? Number(creditHours) : undefined,
    });

    return res.status(201).json(subject);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const id = req.params.id as string;
    const { code, name, creditHours, year, semester } = req.body;

    // Verify it belongs to teacher's major before updating
    const existing = await subjectService.getSubjectById(id);
    if (existing.major !== teacher.major) {
      return res.status(403).json({ message: "Forbidden: subject is outside your major." });
    }

    const subject = await subjectService.updateSubject(id, {
      code,
      name,
      year,
      semester: semester !== undefined ? Number(semester) : undefined,
      creditHours: creditHours ? Number(creditHours) : undefined,
    });

    return res.json(subject);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await teacherService.getTeacherByUserId(req.user.id);
    const id = req.params.id as string;

    const existing = await subjectService.getSubjectById(id);
    if (existing.major !== teacher.major) {
      return res.status(403).json({ message: "Forbidden: subject is outside your major." });
    }

    await subjectService.removeSubject(id);
    return res.json({ message: "Subject removed successfully." });
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
