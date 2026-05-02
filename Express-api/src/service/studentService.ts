import { Major, AcademicYear } from "@prisma/client";
import * as studentRepo from "../respositry/studentRepository";
import { ServiceError } from "./userService";
import prisma from "../lib/prisma";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getStudentById(id: string) {
  const student = await studentRepo.findStudentById(id);
  if (!student) throw new ServiceError(404, "Student not found.");
  return student;
}

// Inside studentService.ts
export async function getStudentByUserId(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId: userId },
    include: { user: true }
  });

  if (!student) {
    throw new ServiceError(404, "Student profile not found. Please ensure you have a student record in the database linked to your account.");
  }
  return student;
}

export async function getStudentByRollNo(rollNo: string) {
  return studentRepo.findStudentByRollNo(rollNo);
}

export async function listStudents(params?: {
  major?: Major;
  year?: AcademicYear;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return studentRepo.findAllStudents(params);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createStudent(data: {
  userId: string;
  rollNo: string;
  name: string;
  major: Major;
  year: AcademicYear;
  phone?: string;
  birthDate?: Date;
}) {
  // Check for duplicate roll number
  const existing = await studentRepo.findStudentByRollNo(data.rollNo);
  if (existing)
    throw new ServiceError(409, `Roll number ${data.rollNo} already exists.`);

  return studentRepo.createStudent(data);
}

export async function completeStudentProfile(data: {
  userId: string;
  rollNo: string;
  year: AcademicYear;
  phoneNumber?: string;
  address?: string;
}) {
  // Check if rollNo already exists for another student
  const existing = await studentRepo.findStudentByRollNo(data.rollNo);
  if (existing && existing.userId !== data.userId) {
    throw new ServiceError(409, `Roll number ${data.rollNo} already exists.`);
  }

  return studentRepo.updateStudentProfile(data);
}

export async function updateStudent(
  id: string,
  data: {
    name?: string;
    major?: Major;
    year?: AcademicYear;
    phone?: string;
    birthDate?: Date;
  },
) {
  await getStudentById(id);
  return studentRepo.updateStudent(id, data);
}

export async function removeStudent(id: string) {
  await getStudentById(id);
  return studentRepo.deleteStudent(id);
}

export async function bulkCreateStudents(
  records: {
    userId: string;
    rollNo: string;
    name: string;
    major: Major;
    year: AcademicYear;
    phone?: string;
  }[],
) {
  return studentRepo.createManyStudents(records);
}
