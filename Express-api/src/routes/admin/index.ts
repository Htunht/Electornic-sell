import { Router } from "express";
import { adminGuard, requireRole } from "../../middleware/auth";

// Controllers
import * as userCtrl from "../../controller/admin/userController";
import * as studentCtrl from "../../controller/admin/studentController";
import * as teacherCtrl from "../../controller/admin/teacherController";
import * as subjectCtrl from "../../controller/admin/subjectController";
import * as resultCtrl from "../../controller/admin/resultController";
import * as assignmentCtrl from "../../controller/admin/assignmentController";
import * as calendarCtrl from "../../controller/admin/calendarController";

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// All admin routes require at least SUPER_ADMIN role
// ═══════════════════════════════════════════════════════════════════════════
router.use(adminGuard as any);

// ─── Users ────────────────────────────────────────────────────────────────
router.get("/users", userCtrl.listUsers as any);
router.get("/users/:id", userCtrl.getUser as any);
router.post("/users", userCtrl.createUser as any);
router.patch("/users/:id/role", userCtrl.changeRole as any);
router.delete("/users/:id", userCtrl.deleteUser as any);

// ─── Students ─────────────────────────────────────────────────────────────
router.get("/students", studentCtrl.listStudents as any);
router.get("/students/:id", studentCtrl.getStudent as any);
router.post("/students", studentCtrl.createStudent as any);
router.put("/students/:id", studentCtrl.updateStudent as any);
router.delete("/students/:id", studentCtrl.deleteStudent as any);

// ─── Teachers ─────────────────────────────────────────────────────────────
router.get("/teachers", teacherCtrl.listTeachers as any);
router.get("/teachers/:id", teacherCtrl.getTeacher as any);
router.get("/teachers/major-head/:major", teacherCtrl.getMajorHead as any);
router.post("/teachers", teacherCtrl.createTeacher as any);
router.put("/teachers/:id", teacherCtrl.updateTeacher as any);
router.delete("/teachers/:id", teacherCtrl.deleteTeacher as any);

// ─── Subjects ─────────────────────────────────────────────────────────────
router.get("/subjects", subjectCtrl.listSubjects as any);
router.get("/subjects/:id", subjectCtrl.getSubject as any);
router.post("/subjects", subjectCtrl.createSubject as any);
router.put("/subjects/:id", subjectCtrl.updateSubject as any);
router.delete("/subjects/:id", subjectCtrl.deleteSubject as any);

// ─── Subject Assignments ──────────────────────────────────────────────────
router.get("/assignments/teacher/:teacherId", assignmentCtrl.getTeacherAssignments as any);
router.get("/assignments/class", assignmentCtrl.getClassAssignments as any);
router.post("/assignments", assignmentCtrl.createAssignment as any);
router.patch("/assignments/:id/toggle", assignmentCtrl.toggleEditPermission as any);
router.delete("/assignments/:id", assignmentCtrl.deleteAssignment as any);

// ─── Results ──────────────────────────────────────────────────────────────
router.get("/results", resultCtrl.listResults as any);
router.get("/results/student/:studentId", resultCtrl.getStudentResults as any);
router.get("/results/pending/:major", resultCtrl.getPendingResults as any);
router.post("/results/:id/approve", resultCtrl.approveResult as any);
router.post("/results/bulk-approve", resultCtrl.bulkApproveResults as any);
router.delete("/results/:id", resultCtrl.deleteResult as any);

// ─── Calendar ─────────────────────────────────────────────────────────────
router.get("/calendar", calendarCtrl.listEvents as any);
router.get("/calendar/:id", calendarCtrl.getEvent as any);
router.post("/calendar", calendarCtrl.createEvent as any);
router.put("/calendar/:id", calendarCtrl.updateEvent as any);
router.delete("/calendar/:id", calendarCtrl.deleteEvent as any);

export default router;
