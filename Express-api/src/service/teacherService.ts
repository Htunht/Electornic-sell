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
  majorHead?: Major;
  minorDept?: string;
}) {
  return teacherRepo.createTeacher(data);
}

export async function updateTeacher(
  id: string,
  data: {
    name?: string;
    phone?: string;
    majorHead?: Major | null;
    minorDept?: string | null;
  },
) {
  await getTeacherById(id);
  return teacherRepo.updateTeacher(id, data);
}

export async function removeTeacher(id: string) {
  await getTeacherById(id);
  return teacherRepo.deleteTeacher(id);
}
