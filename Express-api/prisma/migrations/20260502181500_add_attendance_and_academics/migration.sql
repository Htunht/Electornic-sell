-- Add credit hours to subjects
ALTER TABLE "subjects"
ADD COLUMN IF NOT EXISTS "creditHours" INTEGER NOT NULL DEFAULT 3;

-- Add academic fields to results
ALTER TABLE "results"
ADD COLUMN IF NOT EXISTS "semester" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "results"
ADD COLUMN IF NOT EXISTS "academicYear" TEXT NOT NULL DEFAULT '2025-2026';

-- Attendance status enum
DO $$ BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Attendance table
CREATE TABLE IF NOT EXISTS "attendance" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "teacherId" TEXT,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "major" "Major",
  "year" "AcademicYear",
  CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- Unique per student/day/subject
DO $$ BEGIN
  ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_studentId_date_subjectId_key" UNIQUE ("studentId", "date", "subjectId");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "attendance_studentId_date_idx" ON "attendance" ("studentId", "date");
CREATE INDEX IF NOT EXISTS "attendance_major_year_date_idx" ON "attendance" ("major", "year", "date");

-- Foreign keys
DO $$ BEGIN
  ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

