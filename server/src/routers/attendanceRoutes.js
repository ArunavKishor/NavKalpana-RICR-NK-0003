import express from "express";
import {
  getAttendance,
  createAttendance,
  getAttendanceById,
  updateAttendance,
  getStudentAttendanceSummary,
  getBatchAttendanceStats,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.route("/").get(getAttendance).post(createAttendance);
router.route("/:id").get(getAttendanceById).put(updateAttendance);
router.route("/student/:studentId").get(getStudentAttendanceSummary);
router.route("/batch/:batchId").get(getBatchAttendanceStats);

export default router;
