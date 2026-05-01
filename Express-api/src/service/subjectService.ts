import * as subjectRepo from "../respositry/subjectRepository";
import { ServiceError } from "./userService";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getSubjectById(id: string) {
  const subject = await subjectRepo.findSubjectById(id);
  if (!subject) throw new ServiceError(404, "Subject not found.");
  return subject;
}

export async function getSubjectByCode(code: string) {
  return subjectRepo.findSubjectByCode(code);
}

export async function listSubjects(params?: {
  isMinor?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return subjectRepo.findAllSubjects(params);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createSubject(data: {
  code: string;
  name: string;
  isMinor?: boolean;
  creditHours?: number;
}) {
  const existing = await subjectRepo.findSubjectByCode(data.code);
  if (existing)
    throw new ServiceError(409, `Subject code ${data.code} already exists.`);
  return subjectRepo.createSubject(data);
}

export async function updateSubject(
  id: string,
  data: { code?: string; name?: string; isMinor?: boolean; creditHours?: number },
) {
  await getSubjectById(id);
  if (data.code) {
    const dup = await subjectRepo.findSubjectByCode(data.code);
    if (dup && dup.id !== id)
      throw new ServiceError(409, `Subject code ${data.code} already in use.`);
  }
  return subjectRepo.updateSubject(id, data);
}

export async function removeSubject(id: string) {
  await getSubjectById(id);
  return subjectRepo.deleteSubject(id);
}
