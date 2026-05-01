import express from "express";
import * as studentController from "../controller/api/studentController";
import * as teacherController from "../controller/api/teacherController";
import * as calendarController from "../controller/api/calendarController";
import { authGuard, requireRole } from "../middleware/auth";

import { RequestHandler } from "express";

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[API V1] ${req.method} ${req.path}`);
  next();
});

// ---------------------------------------------------------------------------
// Student APIs
// ---------------------------------------------------------------------------
// Only accessible to users with the STUDENT role
router.get("/students/me", authGuard, requireRole("STUDENT"), studentController.getMe as any);
router.get("/students/me/results", authGuard, requireRole("STUDENT"), studentController.getMyResults as any);

// ---------------------------------------------------------------------------
// Teacher APIs
// ---------------------------------------------------------------------------
// Only accessible to users with TEACHER or HEAD roles
router.get("/teachers/me", authGuard, requireRole("TEACHER", "MAJOR_HEAD", "MINOR_HEAD"), teacherController.getMe as any);
router.get("/teachers/me/assignments", authGuard, requireRole("TEACHER", "MAJOR_HEAD", "MINOR_HEAD"), teacherController.getMyAssignments as any);

// ---------------------------------------------------------------------------
// Calendar APIs
// ---------------------------------------------------------------------------
// Accessible to any authenticated user
router.get("/calendar/events", authGuard, calendarController.getMyEvents as any);

export default router;
