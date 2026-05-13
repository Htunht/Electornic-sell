import express from "express";
import type { RequestHandler } from "express";
import * as studentController from "../controller/api/studentController";
import * as headTeacherController from "../controller/api/headTeacherController";
import * as teacherController from "../controller/api/teacherController";
import * as calendarController from "../controller/api/calendarController";
import * as attendanceController from "../controller/api/attendanceController";
import * as announcementController from "../controller/api/announcementController";
import { authGuard, requireRole } from "../middleware/auth";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[API V1] ${req.method} ${req.path}`);
  next();
});

// ---------------------------------------------------------------------------
// Student APIs
// ---------------------------------------------------------------------------
router.get(
  "/students/me",
  authGuard,
  requireRole("STUDENT"),
  studentController.getMe as unknown as RequestHandler,
);
router.get(
  "/students/me/results",
  authGuard,
  requireRole("STUDENT"),
  studentController.getMyResults as unknown as RequestHandler,
);
router.get(
  "/students/me/attendance",
  authGuard,
  requireRole("STUDENT"),
  attendanceController.getMyAttendance as unknown as RequestHandler,
);
router.post(
  "/students/complete-profile",
  authGuard,
  requireRole("STUDENT"),
  studentController.completeProfile as unknown as RequestHandler,
);
router.get(
  "/students/announcements",
  authGuard,
  requireRole("STUDENT"),
  announcementController.getAnnouncements as unknown as RequestHandler,
);

// ---------------------------------------------------------------------------
// Head Teacher APIs
// ---------------------------------------------------------------------------
router.get(
  "/head-teachers/me",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.getMe as unknown as RequestHandler,
);
router.get(
  "/head-teachers/me/assignments",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.getMyAssignments as unknown as RequestHandler,
);
router.get(
  "/head-teachers/me/subjects",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.getMySubjects as unknown as RequestHandler,
);
router.post(
  "/head-teachers/me/assignments",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.createMyAssignment as unknown as RequestHandler,
);
router.delete(
  "/head-teachers/me/assignments/:id",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.deleteMyAssignment as unknown as RequestHandler,
);
router.get(
  "/head-teachers/students",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.getMyStudents as unknown as RequestHandler,
);
router.get(
  "/head-teachers/teachers",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.getAllTeachers as unknown as RequestHandler,
);
router.post(
  "/head-teachers/teachers/:id/assignments",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.assignSubjectToTeacher as unknown as RequestHandler,
);
router.post(
  "/head-teachers/results/bulk",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.bulkUpsertResults as unknown as RequestHandler,
);
router.post(
  "/head-teachers/attendance/bulk",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.bulkUpsertAttendance as unknown as RequestHandler,
);
router.post(
  "/head-teachers/subjects",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.createSubject as unknown as RequestHandler,
);
router.put(
  "/head-teachers/subjects/:id",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.updateSubject as unknown as RequestHandler,
);
router.delete(
  "/head-teachers/subjects/:id",
  authGuard,
  requireRole("HEAD_TEACHER"),
  headTeacherController.deleteSubject as unknown as RequestHandler,
);
router.post(
  "/head-teachers/announcements",
  authGuard,
  requireRole("HEAD_TEACHER"),
  announcementController.createAnnouncement as unknown as RequestHandler,
);
router.get(
  "/head-teachers/announcements",
  authGuard,
  requireRole("HEAD_TEACHER"),
  announcementController.getAllAnnouncements as unknown as RequestHandler,
);
router.delete(
  "/head-teachers/announcements/:id",
  authGuard,
  requireRole("HEAD_TEACHER"),
  announcementController.deleteAnnouncement as unknown as RequestHandler,
);

// ---------------------------------------------------------------------------
// Teacher APIs (Regular)
// ---------------------------------------------------------------------------
router.get(
  "/teachers/me",
  authGuard,
  requireRole("TEACHER"),
  teacherController.getMe as unknown as RequestHandler,
);
router.get(
  "/teachers/me/assignments",
  authGuard,
  requireRole("TEACHER"),
  teacherController.getMyAssignments as unknown as RequestHandler,
);
router.get(
  "/teachers/me/subjects",
  authGuard,
  requireRole("TEACHER"),
  teacherController.getMySubjects as unknown as RequestHandler,
);
router.post(
  "/teachers/me/assignments",
  authGuard,
  requireRole("TEACHER"),
  teacherController.createMyAssignment as unknown as RequestHandler,
);
router.delete(
  "/teachers/me/assignments/:id",
  authGuard,
  requireRole("TEACHER"),
  teacherController.deleteMyAssignment as unknown as RequestHandler,
);
router.get(
  "/teachers/students",
  authGuard,
  requireRole("TEACHER"),
  teacherController.getMyStudents as unknown as RequestHandler,
);
router.post(
  "/teachers/results/bulk",
  authGuard,
  requireRole("TEACHER"),
  teacherController.bulkUpsertResults as unknown as RequestHandler,
);
router.post(
  "/teachers/attendance/bulk",
  authGuard,
  requireRole("TEACHER"),
  teacherController.bulkUpsertAttendance as unknown as RequestHandler,
);
router.get(
  "/teachers/announcements",
  authGuard,
  requireRole("TEACHER"),
  announcementController.getAnnouncements as unknown as RequestHandler,
);

// ---------------------------------------------------------------------------
// Calendar APIs
// ---------------------------------------------------------------------------
router.get(
  "/calendar/events",
  authGuard,
  calendarController.getMyEvents as unknown as RequestHandler,
);
router.post(
  "/calendar/events",
  authGuard,
  requireRole("HEAD_TEACHER"),
  calendarController.saveEvent as unknown as RequestHandler,
);

export default router;
