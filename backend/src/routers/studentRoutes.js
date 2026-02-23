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
  getStudentAttendance,
} from "../controllers/studentController.js";

import { getStudentDashboard } from "../controllers/studentDashboardController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// Student specific routes
router
  .route("/me/dashboard")
  .get(authorize("student", "admin"), getStudentDashboard);
router
  .route("/me")
  .get(authorize("student", "admin"), getStudentProfile)
  .put(authorize("student", "admin"), updateStudentProfile);

// Student profile photo upload
router
  .route("/me/upload-photo")
  .post(
    authorize("student", "admin"),
    upload.single("file"),
    uploadProfilePhoto,
  );

/* =====================================
   ADMIN / TEACHER ONLY ROUTES
===================================== */
router.use(authorize("admin", "teacher"));

router.route("/").get(getStudents).post(createStudent);

router
  .route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

router.route("/:id/progress").get(getStudentProgress);

router.route("/:id/batches").get(getStudentBatches);

router.route("/:id/enroll").post(enrollStudentInBatch);

router.route("/:id/unenroll").post(unenrollStudentFromBatch);

router.route("/:id/progress").get(getStudentProgress);

router.route("/:id/attendance").get(getStudentAttendance);

/* =====================================
   EXPORT ROUTER
===================================== */
export default router;
