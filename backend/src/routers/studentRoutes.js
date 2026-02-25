import express from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentBatches,
  enrollStudentInBatch,
  unenrollStudentFromBatch,
  getStudentProgress,
  getStudentAttendance
} from "../controllers/studentController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =====================================
   PROTECTED ROUTES (Logged-in users)
===================================== */
router.use(protect);

/* =====================================
   ADMIN / TEACHER ONLY ROUTES
===================================== */
router.use(authorize("admin", "teacher"));

// All students
router
  .route("/")
  .get(getStudents)
  .post(createStudent);

// Student by ID
router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

// Student Progress
router
  .route("/:id/progress")
  .get(getStudentProgress);

// Student Batches
router
  .route("/:id/batches")
  .get(getStudentBatches);

// Student Attendance
router
  .route("/:id/attendance")
  .get(getStudentAttendance);

// Enroll/Unenroll Student from Batch
router
  .route("/:id/enroll")
  .post(enrollStudentInBatch);

router
  .route("/:id/unenroll")
  .post(unenrollStudentFromBatch);

/* =====================================
   EXPORT ROUTER
===================================== */
export default router;
