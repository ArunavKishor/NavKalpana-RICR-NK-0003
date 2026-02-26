import express from "express";
import {
  getDashboardStats,
  getPerformanceAnalytics,
  getUpcomingDeadlines,
  getTrends,
  getTeacherStats,
  getTeacherPerformance,
} from "../controllers/dashboardController.js";
import {
  getTeacherClassAnalytics,
  getLeaderboard,
  getStudentWeeklySnapshots,
} from "../controllers/analyticsController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  cacheMiddleware,
  setHttpCacheHeaders,
} from "../middlewares/cacheMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "teacher"));
router.use(setHttpCacheHeaders(false, 300)); // 5 minutes cache for authenticated users

// Cache dashboard stats for 5 minutes
router
  .route("/stats")
  .get(cacheMiddleware("dashboard:stats", 300), getDashboardStats);

// Cache performance analytics for 10 minutes
router
  .route("/performance")
  .get(cacheMiddleware("dashboard:performance", 600), getPerformanceAnalytics);

// Cache deadlines for 5 minutes
router
  .route("/deadlines")
  .get(cacheMiddleware("dashboard:deadlines", 300), getUpcomingDeadlines);

// Cache trends for 10 minutes
router
  .route("/trends")
  .get(cacheMiddleware("dashboard:trends", 600), getTrends);

// Teacher-specific endpoints - cache for 5 minutes
router
  .route("/teacher/stats")
  .get(
    authorize("teacher", "admin"),
    cacheMiddleware("dashboard:teacher:stats", 300),
    getTeacherStats,
  );

router
  .route("/teacher/performance")
  .get(
    authorize("teacher", "admin"),
    cacheMiddleware("dashboard:teacher:performance", 600),
    getTeacherPerformance,
  );

// Advanced analytics & leaderboard - cache for 10 minutes
router
  .route("/teacher/analytics")
  .get(
    authorize("teacher", "admin"),
    cacheMiddleware("dashboard:teacher:analytics", 600),
    getTeacherClassAnalytics,
  );

router
  .route("/teacher/leaderboard")
  .get(
    authorize("teacher", "admin"),
    cacheMiddleware("dashboard:teacher:leaderboard", 600),
    getLeaderboard,
  );

router
  .route("/students/:id/weekly-snapshots")
  .get(
    authorize("teacher", "admin"),
    cacheMiddleware("dashboard:weekly-snapshots", 600),
    getStudentWeeklySnapshots,
  );

export default router;
