-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('URGENT', 'INFO', 'ACADEMIC', 'GENERAL');

-- CreateEnum
CREATE TYPE "GradeSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'HEAD_TEACHER';

-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "question_papers" DROP CONSTRAINT "question_papers_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "question_papers" DROP CONSTRAINT "question_papers_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "results" DROP CONSTRAINT "results_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "results" DROP CONSTRAINT "results_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_subjectId_fkey";

-- DropIndex
DROP INDEX "subjects_major_year_idx";

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "headTeacherId" TEXT;

-- AlterTable
ALTER TABLE "question_papers" ADD COLUMN     "headTeacherId" TEXT,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "results" ADD COLUMN     "headTeacherId" TEXT,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "semester" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "head-teachers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "major" "Major" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "head-teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_assignments" (
    "id" TEXT NOT NULL,
    "headTeacherId" TEXT,
    "teacherId" TEXT,
    "subjectId" TEXT NOT NULL,
    "major" "Major" NOT NULL,
    "year" "AcademicYear" NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_submissions" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "academicYear" TEXT NOT NULL DEFAULT '2025-2026',
    "major" "Major" NOT NULL,
    "year" "AcademicYear" NOT NULL,
    "status" "GradeSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "teacherId" TEXT,
    "headTeacherId" TEXT,
    "major" "Major",
    "year" "AcademicYear",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "teacherId" TEXT,
    "headTeacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "head-teachers_userId_key" ON "head-teachers"("userId");

-- CreateIndex
CREATE INDEX "subject_assignments_teacherId_idx" ON "subject_assignments"("teacherId");

-- CreateIndex
CREATE INDEX "subject_assignments_headTeacherId_idx" ON "subject_assignments"("headTeacherId");

-- CreateIndex
CREATE INDEX "subject_assignments_major_year_idx" ON "subject_assignments"("major", "year");

-- CreateIndex
CREATE UNIQUE INDEX "subject_assignments_teacherId_subjectId_major_year_key" ON "subject_assignments"("teacherId", "subjectId", "major", "year");

-- CreateIndex
CREATE UNIQUE INDEX "subject_assignments_headTeacherId_subjectId_major_year_key" ON "subject_assignments"("headTeacherId", "subjectId", "major", "year");

-- CreateIndex
CREATE UNIQUE INDEX "subject_assignments_subjectId_major_year_key" ON "subject_assignments"("subjectId", "major", "year");

-- CreateIndex
CREATE INDEX "grade_submissions_status_major_idx" ON "grade_submissions"("status", "major");

-- CreateIndex
CREATE INDEX "grade_submissions_teacherId_idx" ON "grade_submissions"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_submissions_teacherId_studentId_subjectId_key" ON "grade_submissions"("teacherId", "studentId", "subjectId");

-- CreateIndex
CREATE INDEX "announcements_major_year_idx" ON "announcements"("major", "year");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_events_date_key" ON "calendar_events"("date");

-- CreateIndex
CREATE INDEX "subjects_major_year_semester_idx" ON "subjects"("major", "year", "semester");

-- AddForeignKey
ALTER TABLE "head-teachers" ADD CONSTRAINT "head-teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "head-teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "head-teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_papers" ADD CONSTRAINT "question_papers_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "head-teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "head-teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "head-teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "head-teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "head-teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
