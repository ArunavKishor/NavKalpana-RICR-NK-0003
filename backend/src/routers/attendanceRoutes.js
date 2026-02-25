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

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student can view their own attendance
router.route("/me").get(authorize("student", "admin"), getMyAttendance);

// Admin/Teacher only routes
router.use(authorize("admin", "teacher"));
router.route("/").get(getAttendance).post(createAttendance);
router.route("/export").get(exportAttendance);
router.route("/:id").get(getAttendanceById).put(updateAttendance);
router.route("/student/:studentId").get(getStudentAttendanceSummary);
router.route("/batch/:batchId").get(getBatchAttendanceStats);

export default router;
