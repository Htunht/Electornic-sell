import { Major } from "@prisma/client";
import * as teacherRepo from "../respositry/teacherRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getTeacherById(id: string) {
  const teacher = await teacherRepo.findTeacherById(id);
  if (!teacher) throw new ServiceError(404, "Teacher not found.");
  return teacher;
}

export async function getTeacherByUserId(userId: string) {
  const teacher = await teacherRepo.findTeacherByUserId(userId);
  if (!teacher) throw new ServiceError(404, "Teacher profile not found.");
  return teacher;
}

export async function listTeachers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return teacherRepo.findAllTeachers(params);
}

export async function getMajorHead(major: Major) {
  return teacherRepo.findMajorHead(major);
}

export async function getMinorHeads() {
  return teacherRepo.findMinorHeads();
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createTeacher(data: {
  userId: string;
  name: string;
  phone?: string;
  major: Major;
}) {
  return teacherRepo.createTeacher(data);
}

export async function updateTeacher(
  id: string,
  data: {
    name?: string;
    phone?: string;
    major?: Major;
  },
) {
  await getTeacherById(id);
  return teacherRepo.updateTeacher(id, data);
}

export async function removeTeacher(id: string) {
  await getTeacherById(id);
  return teacherRepo.deleteTeacher(id);
}

// express-api/src/service/teacherService.ts

/** ဘာသာရပ်အလိုက် Attendance သိမ်းရန် */
export async function saveAttendance(subjectId: string, attendanceData: any[]) {
  // လိုအပ်သော logic စစ်ဆေးမှုများ ဤနေရာတွင် ပြုလုပ်နိုင်သည်
  return teacherRepo.bulkUpdateAttendance(subjectId, attendanceData);
}

/** ကျောင်းသားအလိုက် အမှတ်သိမ်းရန် */
export async function updateStudentMarks(
  studentId: string,
  subjectId: string,
  marks: number,
  userId: string,
) {
  if (marks < 0 || marks > 100) {
    throw new ServiceError(400, "Marks must be between 0 and 100.");
  }
  const teacher = await getTeacherByUserId(userId);
  return teacherRepo.upsertStudentMarks(
    studentId,
    subjectId,
    marks,
    teacher.id,
  );
}
