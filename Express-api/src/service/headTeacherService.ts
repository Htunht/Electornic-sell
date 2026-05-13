import { Major } from "@prisma/client";
import * as headTeacherRepo from "../respositry/headTeacherRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getHeadTeacherById(id: string) {
  const headTeacher = await headTeacherRepo.findHeadTeacherById(id);
  if (!headTeacher) throw new ServiceError(404, "Head Teacher not found.");
  return headTeacher;
}

export async function getHeadTeacherByUserId(userId: string) {
  const headTeacher = await headTeacherRepo.findHeadTeacherByUserId(userId);
  if (!headTeacher) throw new ServiceError(404, "Head Teacher profile not found.");
  return headTeacher;
}

export async function listHeadTeachers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return headTeacherRepo.findAllHeadTeachers(params);
}

export async function getAllTeachers(major: Major) {
  return headTeacherRepo.findAllTeachersWithAssignments(major);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createHeadTeacher(data: {
  userId: string;
  major: Major;
}) {
  return headTeacherRepo.createHeadTeacher(data);
}

export async function updateHeadTeacher(
  id: string,
  data: {
    major?: Major;
  },
) {
  await getHeadTeacherById(id);
  return headTeacherRepo.updateHeadTeacher(id, data);
}

export async function removeHeadTeacher(id: string) {
  await getHeadTeacherById(id);
  return headTeacherRepo.deleteHeadTeacher(id);
}

/** Save attendance by subject */
export async function saveAttendance(subjectId: string, attendanceData: any[], userId: string) {
  const headTeacher = await getHeadTeacherByUserId(userId);
  return headTeacherRepo.bulkUpdateAttendance(subjectId, attendanceData, headTeacher.id);
}

/** Upsert student marks */
export async function updateStudentMarks(
  studentId: string,
  subjectId: string,
  marks: number,
  userId: string,
) {
  if (marks < 0 || marks > 100) {
    throw new ServiceError(400, "Marks must be between 0 and 100.");
  }
  const headTeacher = await getHeadTeacherByUserId(userId);
  return headTeacherRepo.upsertStudentMarks(
    studentId,
    subjectId,
    marks,
    headTeacher.id,
  );
}
