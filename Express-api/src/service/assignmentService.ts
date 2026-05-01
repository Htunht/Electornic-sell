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

export async function getClassAssignments(major: Major, year: AcademicYear) {
  return assignmentRepo.findAssignmentsByClass(major, year);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function assignTeacher(data: {
  teacherId: string;
  subjectId: string;
  major: Major;
  year: AcademicYear;
  canEdit?: boolean;
}) {
  // Check for duplicate assignment
  const existing = await assignmentRepo.findTeacherAssignment(
    data.teacherId,
    data.subjectId,
    data.major,
    data.year,
  );
  if (existing) {
    throw new ServiceError(409, "Teacher is already assigned to this subject for this class.");
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
