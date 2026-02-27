import express from "express";
import {
  getAttendance,
  createAttendance,
  getAttendanceById,
  updateAttendance,
  getStudentAttendanceSummary,
  getBatchAttendanceStats,
  exportAttendance,
  getMyAttendance,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  cacheMiddleware,
  setHttpCacheHeaders,
} from "../middlewares/cacheMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student-accessible route (must be before admin/teacher middleware)
router
  .route("/my")
  .get(
    authorize("student"),
    cacheMiddleware("attendance:my", 300),
    getMyAttendance,
  );

// Admin/Teacher only routes
router.use(authorize("admin", "teacher"));
router.use(setHttpCacheHeaders(false, 300)); // 5 minutes cache for authenticated users

router
  .route("/")
  .get(cacheMiddleware("attendance:list", 300), getAttendance)
  .post(createAttendance);

router
  .route("/export")
  .get(cacheMiddleware("attendance:export", 600), exportAttendance);

router
  .route("/:id")
  .get(cacheMiddleware("attendance:detail", 300), getAttendanceById)
  .put(updateAttendance);

router
  .route("/student/:studentId")
  .get(cacheMiddleware("attendance:student", 300), getStudentAttendanceSummary);

router
  .route("/batch/:batchId")
  .get(cacheMiddleware("attendance:batch", 300), getBatchAttendanceStats);

export default router;
