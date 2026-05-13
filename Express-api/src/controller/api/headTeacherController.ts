import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import * as headTeacherService from "../../service/headTeacherService";
import * as subjectService from "../../service/subjectService";
import * as studentService from "../../service/studentService";
import * as resultService from "../../service/resultService";
import * as attendanceService from "../../service/attendanceService";
import * as assignmentService from "../../service/assignmentService";
import * as gradeSubmissionService from "../../service/gradeSubmissionService";
import { ServiceError } from "../../service/userService";
import { AcademicYear, AttendanceStatus } from "@prisma/client";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    let headTeacher;
    try {
      headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    } catch (err: any) {
      if (err instanceof ServiceError && err.status === 404) {
        console.log(
          `[AUTO-PROFILE] Creating head teacher profile for user ${req.user.email}`,
        );
        headTeacher = await headTeacherService.createHeadTeacher({
          userId: req.user.id,
          major: "IT", // Default major
        });
      } else {
        throw err;
      }
    }
    console.log(
      `[HEAD-TEACHER API] Success: Returned profile for ${req.user.email}`,
    );
    return res.json(headTeacher);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyAssignments(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const assignments = await assignmentService.getHeadTeacherAssignments(headTeacher.id);

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
      headTeacherId: headTeacher.id,
      major: headTeacher.major,
      byYear: grouped,
      assignments,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMySubjects(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { year } = req.query;

    const subjects = await subjectService.getSubjectsByMajor(headTeacher.major);
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
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { subjectId, year, canEdit } = req.body as {
      subjectId: string;
      year: AcademicYear;
      canEdit?: boolean;
    };

    if (!subjectId || !year) {
      return res.status(400).json({ message: "subjectId and year are required." });
    }

    const subject = await subjectService.getSubjectById(subjectId);
    if (subject.major !== headTeacher.major) {
      return res.status(403).json({ message: "Forbidden: subject is outside your major." });
    }
    if (String(subject.year) !== String(year)) {
      return res.status(400).json({ message: "year must match the subject.year." });
    }

    const assignment = await assignmentService.assignTeacher({
      headTeacherId: headTeacher.id,
      subjectId,
      major: headTeacher.major,
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
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { id } = req.params as { id: string };

    const assignment = await assignmentService.getAssignmentById(id);
    
    // Check if it's their own assignment (either as teacher or head teacher)
    // OR if they are the head teacher of the major (administrative power)
    const isOwner = assignment.headTeacherId === headTeacher.id || assignment.teacherId === headTeacher.id;
    const isMajorAdmin = assignment.major === headTeacher.major;

    if (!isOwner && !isMajorAdmin) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to delete this assignment." });
    }

    await assignmentService.removeAssignment(id);
    return res.json({ message: "Assignment removed." });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getMyStudents(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { year, search, page, limit } = req.query;

    const result = await studentService.listStudents({
      major: headTeacher.major,
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

export async function getAllTeachers(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const teachers = await headTeacherService.getAllTeachers(headTeacher.major);
    return res.json(teachers);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function bulkUpsertResults(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
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

    // Permission check: Head Teacher can manage any subject in their Major
    const subject = await subjectService.getSubjectById(subjectId);
    if (subject.major !== headTeacher.major) {
      return res.status(403).json({ 
        message: "Forbidden: This subject belongs to another department." 
      });
    }

    const result = await resultService.bulkUpsertResults({
      headTeacherId: headTeacher.id,
      subjectId,
      major: headTeacher.major,
      year,
      records,
      meta: {
        semester,
        academicYear,
      },
    });
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
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
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

    // Permission check: Head Teacher can manage any subject in their Major
    const subject = await subjectService.getSubjectById(subjectId);
    if (subject.major !== headTeacher.major) {
      return res.status(403).json({ 
        message: "Forbidden: This subject belongs to another department." 
      });
    }

    const dt = new Date(date);
    const data = records.map((r) => ({
      studentId: r.studentId,
      date: dt,
      status: r.status,
      subjectId,
      headTeacherId: headTeacher.id,
      major: headTeacher.major,
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
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { code, name, year, semester, creditHours } = req.body;

    if (!code || !name || !year) {
      return res
        .status(400)
        .json({ message: "code, name, and year are required." });
    }

    const subject = await subjectService.createSubject({
      code,
      name,
      major: headTeacher.major,
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
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const id = req.params.id as string;
    const { code, name, creditHours, year, semester } = req.body;

    const existing = await subjectService.getSubjectById(id);
    if (existing.major !== headTeacher.major) {
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
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const id = req.params.id as string;

    const existing = await subjectService.getSubjectById(id);
    if (existing.major !== headTeacher.major) {
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
  console.error("Head Teacher API Controller error:", error);
  return res.status(500).json({ message: "Internal server error." });
}
export async function assignSubjectToTeacher(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { id: teacherId } = req.params as { id: string };
    const { subjectId, year, canEdit } = req.body as {
      subjectId: string;
      year: AcademicYear;
      canEdit?: boolean;
    };

    const assignment = await assignmentService.assignTeacher({
      teacherId,
      subjectId,
      major: headTeacher.major,
      year,
      canEdit,
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return handleError(res, error);
  }
}

// ---------------------------------------------------------------------------
// Grade Submission Review Endpoints
// ---------------------------------------------------------------------------

export async function getPendingGradeSubmissions(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const submissions = await gradeSubmissionService.getPendingSubmissions(headTeacher.major);
    return res.json(submissions);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function approveGradeSubmission(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { id } = req.params as { id: string };
    const { reviewNote } = req.body as { reviewNote?: string };
    const result = await gradeSubmissionService.approveSubmission(id, headTeacher.id, reviewNote);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function bulkApproveGradeSubmissions(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids array is required." });
    }
    const result = await gradeSubmissionService.bulkApproveSubmissions(ids, headTeacher.id);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function rejectGradeSubmission(req: AuthenticatedRequest, res: Response) {
  try {
    const headTeacher = await headTeacherService.getHeadTeacherByUserId(req.user.id);
    const { id } = req.params as { id: string };
    const { reviewNote } = req.body as { reviewNote?: string };
    const result = await gradeSubmissionService.rejectSubmission(id, headTeacher.id, reviewNote);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}
