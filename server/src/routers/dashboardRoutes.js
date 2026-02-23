import express from "express";
import {
  getDashboardStats,
  getPerformanceAnalytics,
  getUpcomingDeadlines,
  getTrends,
  getTeacherStats,
  getTeacherPerformance,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "teacher"));

router.route("/stats").get(getDashboardStats);
router.route("/performance").get(getPerformanceAnalytics);
router.route("/deadlines").get(getUpcomingDeadlines);
router.route("/trends").get(getTrends);

// Teacher-specific endpoints
router
  .route("/teacher/stats")
  .get(authorize("teacher", "admin"), getTeacherStats);
router
  .route("/teacher/performance")
  .get(authorize("teacher", "admin"), getTeacherPerformance);

export default router;
