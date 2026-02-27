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
  getStudentAttendance,
} from "../controllers/studentController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  cacheMiddleware,
  setHttpCacheHeaders,
} from "../middlewares/cacheMiddleware.js";

const router = express.Router();

/* =====================================
   PROTECTED ROUTES (Logged-in users)
===================================== */
router.use(protect);

/* =====================================
   ADMIN / TEACHER ONLY ROUTES
===================================== */
router.use(authorize("admin", "teacher"));
router.use(setHttpCacheHeaders(false, 300)); // 5 minutes cache for authenticated users

// All students - cache for 5 minutes
router
  .route("/")
  .get(cacheMiddleware("students:list", 300), getStudents)
  .post(createStudent);

// Student by ID - cache for 5 minutes
router
  .route("/:id")
  .get(cacheMiddleware("students:detail", 300), getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

// Student Progress - cache for 10 minutes
router
  .route("/:id/progress")
  .get(cacheMiddleware("students:progress", 600), getStudentProgress);

// Student Batches - cache for 5 minutes
router
  .route("/:id/batches")
  .get(cacheMiddleware("students:batches", 300), getStudentBatches);

// Student Attendance - cache for 5 minutes
router
  .route("/:id/attendance")
  .get(cacheMiddleware("students:attendance", 300), getStudentAttendance);

// Enroll/Unenroll Student from Batch
router.route("/:id/enroll").post(enrollStudentInBatch);

router.route("/:id/unenroll").post(unenrollStudentFromBatch);

/* =====================================
   EXPORT ROUTER
===================================== */
export default router;
