import { AttendanceStatus, Major, AcademicYear, Prisma } from "@prisma/client";
import * as attendanceRepo from "../respositry/attendanceRepository";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getStudentAttendance(
  studentId: string,
  params?: { startDate?: Date; endDate?: Date; subjectId?: string },
) {
  return attendanceRepo.findAttendanceByStudent(studentId, params);
}

export async function getClassAttendance(
  date: Date,
  params?: { subjectId?: string },
) {
  return attendanceRepo.findAttendanceByDate(date, params);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function markAttendance(data: {
  studentId: string;
  date?: Date;
  status: AttendanceStatus;
  subjectId: string;
}) {
  return attendanceRepo.createAttendance(data);
}

export async function bulkMarkAttendance(
  records: {
    studentId: string;
    date: Date;
    status: AttendanceStatus;
    subjectId: string;
  }[],
) {
  return attendanceRepo.createManyAttendance(records);
}

/**
 * Bulk upsert attendance (safe to re-submit).
 * Requires a unique constraint on (studentId, date, subjectId).
 */
export async function bulkUpsertAttendance(
  records: {
    studentId: string;
    date: Date;
    status: AttendanceStatus;
    subjectId: string;
    teacherId?: string;
    major?: Major;
    year?: AcademicYear;
  }[],
) {
  return attendanceRepo.upsertManyAttendance(records);
}

export async function updateAttendanceStatus(
  id: string,
  status: AttendanceStatus,
) {
  return attendanceRepo.updateAttendance(id, status);
}

export async function removeAttendance(id: string) {
  return attendanceRepo.deleteAttendance(id);
}
