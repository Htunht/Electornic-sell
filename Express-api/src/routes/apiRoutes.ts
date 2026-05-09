import express from "express";
import type { RequestHandler } from "express";
import * as studentController from "../controller/api/studentController";
import * as teacherController from "../controller/api/teacherController";
import * as calendarController from "../controller/api/calendarController";
import * as attendanceController from "../controller/api/attendanceController";
import { authGuard, requireRole } from "../middleware/auth";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[API V1] ${req.method} ${req.path}`);
  next();
});

// ---------------------------------------------------------------------------
// Student APIs
// ---------------------------------------------------------------------------
// Only accessible to users with the STUDENT role
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

// ---------------------------------------------------------------------------
// Teacher APIs
// ---------------------------------------------------------------------------
// Only accessible to users with TEACHER or HEAD roles
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
router.post(
  "/teachers/subjects",
  authGuard,
  requireRole("TEACHER"),
  teacherController.createSubject as unknown as RequestHandler,
);
router.put(
  "/teachers/subjects/:id",
  authGuard,
  requireRole("TEACHER"),
  teacherController.updateSubject as unknown as RequestHandler,
);
router.delete(
  "/teachers/subjects/:id",
  authGuard,
  requireRole("TEACHER"),
  teacherController.deleteSubject as unknown as RequestHandler,
);

// ---------------------------------------------------------------------------
// Calendar APIs
// ---------------------------------------------------------------------------
// Accessible to any authenticated user
router.get(
  "/calendar/events",
  authGuard,
  calendarController.getMyEvents as unknown as RequestHandler,
);

export default router;
