import { Major, AcademicYear, GradeSubmissionStatus } from "@prisma/client";
import * as gradeSubmissionRepo from "../respositry/gradeSubmissionRepository";
import * as resultRepo from "../respositry/resultRepository";
import * as assignmentRepo from "../respositry/assignmentRepository";
import { ServiceError } from "./userService";
import { calculateGrade } from "./resultService";

// ---------------------------------------------------------------------------
// Teacher: submit (propose) grades — goes into PENDING state
// ---------------------------------------------------------------------------

export async function submitGrades(
  teacherId: string,
  subjectId: string,
  major: Major,
  year: AcademicYear,
  records: { studentId: string; marks: number }[],
  meta?: { semester?: number; academicYear?: string },
) {
  // Verify teacher or head-teacher is assigned to this subject+class
  const assignment = await assignmentRepo.findAssignmentBySubjectClass(
    subjectId,
    major,
    year,
  );
  if (!assignment || (assignment.teacherId !== teacherId && assignment.headTeacherId !== teacherId)) {
    throw new ServiceError(
      403,
      "Forbidden: you are not assigned to this subject for this class.",
    );
  }

  const mapped = records.map((r) => ({
    ...r,
    grade: calculateGrade(r.marks).grade,
  }));

  return gradeSubmissionRepo.upsertMany({
    teacherId,
    subjectId,
    major,
    year,
    semester: meta?.semester,
    academicYear: meta?.academicYear,
    records: mapped,
  });
}

// ---------------------------------------------------------------------------
// Teacher: view their own submissions
// ---------------------------------------------------------------------------

export async function getTeacherSubmissions(teacherId: string) {
  return gradeSubmissionRepo.findByTeacher(teacherId);
}

// ---------------------------------------------------------------------------
// Head-Teacher: view all pending submissions for their major
// ---------------------------------------------------------------------------

export async function getPendingSubmissions(major: Major) {
  return gradeSubmissionRepo.findPendingByMajor(major);
}

// ---------------------------------------------------------------------------
// Head-Teacher: approve one submission → writes to Result table
// ---------------------------------------------------------------------------

export async function approveSubmission(
  submissionId: string,
  headTeacherId: string,
  reviewNote?: string,
) {
  const sub = await gradeSubmissionRepo.findById(submissionId);
  if (!sub) throw new ServiceError(404, "Grade submission not found.");
  if (sub.status !== "PENDING") {
    throw new ServiceError(400, `Submission is already ${sub.status}.`);
  }

  // Mark the submission approved
  const approved = await gradeSubmissionRepo.updateStatus(
    submissionId,
    "APPROVED",
    headTeacherId,
    reviewNote,
  );

  // Promote to the Result table
  await resultRepo.upsertManyResults({
    teacherId: sub.teacherId,
    subjectId: sub.subjectId,
    major: sub.major,
    year: sub.year,
    semester: sub.semester,
    academicYear: sub.academicYear,
    records: [{ studentId: sub.studentId, marks: sub.marks, grade: sub.grade }],
  });

  return approved;
}

// ---------------------------------------------------------------------------
// Head-Teacher: bulk approve submissions
// ---------------------------------------------------------------------------

export async function bulkApproveSubmissions(
  submissionIds: string[],
  headTeacherId: string,
) {
  const submissions = await Promise.all(
    submissionIds.map((id) => gradeSubmissionRepo.findById(id)),
  );

  const pending = submissions.filter(
    (s) => s !== null && s.status === "PENDING",
  ) as NonNullable<(typeof submissions)[number]>[];

  if (pending.length === 0) {
    throw new ServiceError(400, "No pending submissions to approve.");
  }

  // Bulk-approve in gradeSubmissions table
  await gradeSubmissionRepo.bulkUpdateStatus(
    pending.map((s) => s.id),
    "APPROVED",
    headTeacherId,
  );

  // Promote all to Result table
  for (const sub of pending) {
    await resultRepo.upsertManyResults({
      teacherId: sub.teacherId,
      subjectId: sub.subjectId,
      major: sub.major,
      year: sub.year,
      semester: sub.semester,
      academicYear: sub.academicYear,
      records: [{ studentId: sub.studentId, marks: sub.marks, grade: sub.grade }],
    });
  }

  return { approved: pending.length };
}

// ---------------------------------------------------------------------------
// Head-Teacher: reject one submission
// ---------------------------------------------------------------------------

export async function rejectSubmission(
  submissionId: string,
  headTeacherId: string,
  reviewNote?: string,
) {
  const sub = await gradeSubmissionRepo.findById(submissionId);
  if (!sub) throw new ServiceError(404, "Grade submission not found.");
  if (sub.status !== "PENDING") {
    throw new ServiceError(400, `Submission is already ${sub.status}.`);
  }

  return gradeSubmissionRepo.updateStatus(
    submissionId,
    "REJECTED",
    headTeacherId,
    reviewNote,
  );
}
