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
} from "../controllers/studentController.js";

import { getStudentDashboard } from "../controllers/studentDashboardController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

/* =====================================
   ✅ CREATE ROUTER (THIS WAS MISSING)
===================================== */
const router = express.Router();

/* =====================================
   AUTH PROTECTION (All routes protected)
===================================== */
router.use(protect);

/* =====================================
   STUDENT DASHBOARD
===================================== */
router
  .route("/me/dashboard")
  .get(authorize("student", "admin"), getStudentDashboard);

/* =====================================
   ADMIN / TEACHER ONLY ROUTES
===================================== */
router.use(authorize("admin", "teacher"));

router.route("/")
  .get(getStudents)
  .post(createStudent);

router.route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

router.route("/:id/batches")
  .get(getStudentBatches);

router.route("/:id/enroll")
  .post(enrollStudentInBatch);

router.route("/:id/unenroll")
  .delete(unenrollStudentFromBatch);

/* =====================================
   EXPORT ROUTER
===================================== */
export default router;