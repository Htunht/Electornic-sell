import prisma from "../lib/prisma";
import { Major, AcademicYear } from "@prisma/client";
import * as assignmentRepo from "../respositry/assignmentRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getAssignmentById(id: string) {
  const assignment = await assignmentRepo.findAssignmentById(id);
  if (!assignment) throw new ServiceError(404, "Subject assignment not found.");
  return assignment;
}

export async function getTeacherAssignments(teacherId: string) {
  return assignmentRepo.findAssignmentsByTeacher(teacherId);
}

export async function getHeadTeacherAssignments(headTeacherId: string) {
  return assignmentRepo.findAssignmentsByHeadTeacher(headTeacherId);
}

export async function getClassAssignments(major: Major, year: AcademicYear) {
  return assignmentRepo.findAssignmentsByClass(major, year);
}

export async function isTeacherAssignedToSubject(teacherId: string, subjectId: string) {
  const assignments = await getTeacherAssignments(teacherId);
  return assignments.some((a: any) => a.subjectId === subjectId);
}

export async function isHeadTeacherAssignedToSubject(headTeacherId: string, subjectId: string) {
  const assignments = await getHeadTeacherAssignments(headTeacherId);
  return assignments.some((a: any) => a.subjectId === subjectId);
}

export async function isFacultyAssignedToSubject(userId: string, subjectId: string) {
  // Check if user has a teacher profile and is assigned
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (teacher) {
    const assignments = await getTeacherAssignments(teacher.id);
    if (assignments.some((a: any) => a.subjectId === subjectId)) return true;
  }

  // Check if user has a head teacher profile and is assigned
  const headTeacher = await prisma.headTeacher.findUnique({ where: { userId } });
  if (headTeacher) {
    const assignments = await getHeadTeacherAssignments(headTeacher.id);
    if (assignments.some((a: any) => a.subjectId === subjectId)) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function assignTeacher(data: {
  teacherId?: string;
  headTeacherId?: string;
  subjectId: string;
  major: Major;
  year: AcademicYear;
  canEdit?: boolean;
}) {
  // Business rule: one teacher per subject per major/year.
  // If an assignment exists for this class slot, override it (teacher acts as admin).
  const existingClassSlot = await assignmentRepo.findAssignmentBySubjectClass(
    data.subjectId,
    data.major,
    data.year,
  );

  if (existingClassSlot) {
    if (existingClassSlot.teacherId === data.teacherId && existingClassSlot.headTeacherId === data.headTeacherId) {
      throw new ServiceError(
        409,
        "Teacher is already assigned to this subject for this class.",
      );
    }

    return assignmentRepo.updateAssignment(existingClassSlot.id, {
      teacherId: data.teacherId,
      headTeacherId: data.headTeacherId,
      canEdit: data.canEdit ?? existingClassSlot.canEdit,
    });
  }

  // Also block duplicates for same teacher+subject+class
  const existingTeacherSlot = data.teacherId 
    ? await assignmentRepo.findTeacherAssignment(data.teacherId, data.subjectId, data.major, data.year)
    : data.headTeacherId 
    ? await assignmentRepo.findHeadTeacherAssignment(data.headTeacherId, data.subjectId, data.major, data.year)
    : null;

  if (existingTeacherSlot) {
    throw new ServiceError(
      409,
      "Teacher is already assigned to this subject for this class.",
    );
  }

  return assignmentRepo.createAssignment(data);
}

export async function toggleEditPermission(id: string, canEdit: boolean) {
  await getAssignmentById(id);
  return assignmentRepo.updateAssignment(id, { canEdit });
}

export async function removeAssignment(id: string) {
  await getAssignmentById(id);
  return assignmentRepo.deleteAssignment(id);
}
