import { Major, AcademicYear, ResultStatus } from "@prisma/client";
import * as resultRepo from "../respositry/resultRepository";
import * as assignmentRepo from "../respositry/assignmentRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Grade Calculation Helper
// ---------------------------------------------------------------------------

export function calculateGrade(marks: number): { grade: string; gradePoint: number } {
  if (marks >= 90) return { grade: "A+", gradePoint: 4.0 };
  if (marks >= 80) return { grade: "A", gradePoint: 4.0 };
  if (marks >= 75) return { grade: "B+", gradePoint: 3.5 };
  if (marks >= 70) return { grade: "B", gradePoint: 3.0 };
  if (marks >= 65) return { grade: "C+", gradePoint: 2.5 };
  if (marks >= 60) return { grade: "C", gradePoint: 2.0 };
  if (marks >= 55) return { grade: "D+", gradePoint: 1.5 };
  if (marks >= 50) return { grade: "D", gradePoint: 1.0 };
  return { grade: "F", gradePoint: 0.0 };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getResultById(id: string) {
  const result = await resultRepo.findResultById(id);
  if (!result) throw new ServiceError(404, "Result not found.");
  return result;
}

export async function getStudentResults(studentId: string, academicYear?: string) {
  return resultRepo.findResultsByStudent(studentId, academicYear);
}

export async function getClassResults(params: {
  subjectId: string;
  major?: Major;
  year?: AcademicYear;
  academicYear?: string;
  semester?: number;
  status?: ResultStatus;
  page?: number;
  limit?: number;
}) {
  return resultRepo.findResultsBySubjectAndClass(params);
}

export async function getPendingResults(major: Major) {
  return resultRepo.findPendingResultsByMajor(major);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Upload a result — teacher must be assigned to this subject+class.
 */
export async function uploadResult(
  teacherId: string,
  data: {
    studentId: string;
    subjectId: string;
    marks: number;
    semester: number;
    academicYear: string;
    major: Major;
    year: AcademicYear;
  },
) {
  // Verify teacher has permission for this subject + class
  const assignment = await assignmentRepo.findTeacherAssignment(
    teacherId,
    data.subjectId,
    data.major,
    data.year,
  );

  if (!assignment) {
    throw new ServiceError(
      403,
      "You are not assigned to this subject for this class.",
    );
  }

  if (!assignment.canEdit) {
    throw new ServiceError(403, "Your editing permission has been revoked for this assignment.");
  }

  const { grade, gradePoint } = calculateGrade(data.marks);

  return resultRepo.createResult({
    studentId: data.studentId,
    subjectId: data.subjectId,
    marks: data.marks,
    grade,
    gradePoint,
    semester: data.semester,
    academicYear: data.academicYear,
    uploadedBy: teacherId,
  });
}

/**
 * Bulk upload results for a class.
 */
export async function bulkUploadResults(
  teacherId: string,
  subjectId: string,
  major: Major,
  year: AcademicYear,
  records: {
    studentId: string;
    marks: number;
    semester: number;
    academicYear: string;
  }[],
) {
  // Verify assignment
  const assignment = await assignmentRepo.findTeacherAssignment(
    teacherId,
    subjectId,
    major,
    year,
  );

  if (!assignment || !assignment.canEdit) {
    throw new ServiceError(403, "Not authorized to upload results for this class.");
  }

  const data = records.map((r) => {
    const { grade, gradePoint } = calculateGrade(r.marks);
    return {
      studentId: r.studentId,
      subjectId,
      marks: r.marks,
      grade,
      gradePoint,
      semester: r.semester,
      academicYear: r.academicYear,
      uploadedBy: teacherId,
    };
  });

  return resultRepo.createManyResults(data);
}

/**
 * Approve or reject results — Major Head action.
 */
export async function approveResult(
  resultId: string,
  status: "APPROVED" | "REJECTED",
  approvedBy: string,
) {
  const result = await getResultById(resultId);
  if (result.status !== "PENDING") {
    throw new ServiceError(400, `Result already ${result.status.toLowerCase()}.`);
  }
  return resultRepo.setResultStatus(resultId, status, approvedBy);
}

export async function bulkApproveResults(
  ids: string[],
  status: "APPROVED" | "REJECTED",
  approvedBy: string,
) {
  return resultRepo.bulkSetResultStatus(ids, status, approvedBy);
}

export async function removeResult(id: string) {
  await getResultById(id);
  return resultRepo.deleteResult(id);
}
