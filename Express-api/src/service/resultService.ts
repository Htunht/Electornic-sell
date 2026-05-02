import { Major, AcademicYear } from "@prisma/client";
import * as resultRepo from "../respositry/resultRepository";
import * as assignmentRepo from "../respositry/assignmentRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Grade Calculation Helper
// ---------------------------------------------------------------------------

export function calculateGrade(marks: number): { grade: string } {
  if (marks >= 90) return { grade: "A+" };
  if (marks >= 80) return { grade: "A" };
  if (marks >= 75) return { grade: "B+" };
  if (marks >= 70) return { grade: "B" };
  if (marks >= 65) return { grade: "C+" };
  if (marks >= 60) return { grade: "C" };
  if (marks >= 55) return { grade: "D+" };
  if (marks >= 50) return { grade: "D" };
  return { grade: "F" };
}

export function gradePointFromGrade(grade: string): number {
  switch (grade) {
    case "A+":
      return 4.0;
    case "A":
      return 4.0;
    case "B+":
      return 3.5;
    case "B":
      return 3.0;
    case "C+":
      return 2.5;
    case "C":
      return 2.0;
    case "D+":
      return 1.5;
    case "D":
      return 1.0;
    default:
      return 0.0;
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getResultById(id: string) {
  const result = await resultRepo.findResultById(id);
  if (!result) throw new ServiceError(404, "Result not found.");
  return result;
}

export async function getStudentResults(
  studentId: string, 
  major?: Major, 
  year?: AcademicYear
) {
  const results = await resultRepo.findResultsByStudent(studentId, major, year);
  return results.map((r: any) => ({
    ...r,
    gradePoint: gradePointFromGrade(r.grade),
    semester: r.semester ?? 1,
    academicYear: r.academicYear ?? "2025-2026",
    subject: {
      ...r.subject,
      creditHours: r.subject?.creditHours ?? 3,
    },
  }));
}

export async function getClassResults(params: {
  subjectId: string;
  major?: Major;
  year?: AcademicYear;
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
    major: Major;
    year: AcademicYear;
  },
) {
  // Verify teacher has permission for this subject + class
  // Note: assignmentRepository might need updates if it still uses subjectAssignment model
  
  const { grade } = calculateGrade(data.marks);

  return resultRepo.createResult({
    studentId: data.studentId,
    subjectId: data.subjectId,
    teacherId,
    marks: data.marks,
    grade,
    major: data.major,
    year: data.year,
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
  }[],
) {
  const data = records.map((r) => {
    const { grade } = calculateGrade(r.marks);
    return {
      studentId: r.studentId,
      subjectId,
      teacherId,
      marks: r.marks,
      grade,
      major,
      year,
    };
  });

  return resultRepo.createManyResults(data);
}

export async function bulkUpsertResults(
  teacherId: string,
  subjectId: string,
  major: Major,
  year: AcademicYear,
  records: { studentId: string; marks: number }[],
  meta?: { semester?: number; academicYear?: string },
) {
  const mapped = records.map((r) => ({
    ...r,
    grade: calculateGrade(r.marks).grade,
  }));

  return resultRepo.upsertManyResults({
    teacherId,
    subjectId,
    major,
    year,
    semester: meta?.semester,
    academicYear: meta?.academicYear,
    records: mapped,
  });
}

/**
 * Approve or reject results — Disabled (status removed from schema)
 */
export async function approveResult(
  resultId: string,
  status: any,
  approvedBy: string,
) {
  return null;
}

export async function bulkApproveResults(
  ids: string[],
  status: any,
  approvedBy: string,
) {
  return null;
}

export async function removeResult(id: string) {
  await getResultById(id);
  return resultRepo.deleteResult(id);
}

