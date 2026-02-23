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
  getStudentProfile,
  updateStudentProfile,
  getStudentProgress,
  uploadProfilePhoto,
  getStudentAttendance   // ✅ FIXED (was missing)
} from "../controllers/studentController.js";

import { getStudentDashboard } from "../controllers/studentDashboardController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/* =====================================
   PROTECTED ROUTES (Logged-in users)
===================================== */
router.use(protect);

/* =====================================
   STUDENT / ADMIN ROUTES
===================================== */

// Dashboard
router
  .route("/me/dashboard")
  .get(authorize("student", "admin"), getStudentDashboard);

// Profile
router
  .route("/me")
  .get(authorize("student", "admin"), getStudentProfile)
  .put(authorize("student", "admin"), updateStudentProfile);

// Profile Photo Upload
router
  .route("/me/upload-photo")
  .post(
    authorize("student", "admin"),
    upload.single("file"),
    uploadProfilePhoto
  );

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

/* =====================================
   EXPORT ROUTER
===================================== */
export default router;