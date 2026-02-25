import express from "express";
import {
  createSupportRequest,
  getSupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  respondToSupportRequest,
  resolveSupportRequest,
  getSupportStatistics,
  scheduleBackupClass,
} from "../controllers/supportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(authorize("admin", "teacher"), getSupportRequests).post(
  authorize("student", "admin"),
  createSupportRequest,
);
router
  .route("/statistics")
  .get(authorize("admin", "teacher"), getSupportStatistics);
router
  .route("/:id")
  .get(authorize("admin", "teacher"), getSupportRequestById)
  .put(authorize("admin", "teacher"), updateSupportRequest);
router
  .route("/:id/respond")
  .post(authorize("admin", "teacher"), respondToSupportRequest);
router
  .route("/:id/resolve")
  .put(authorize("admin", "teacher"), resolveSupportRequest);

router
  .route("/:id/schedule-backup-class")
  .post(authorize("admin", "teacher"), scheduleBackupClass);

export default router;
