import express from "express";
import {
  createSupportRequest,
  getSupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  deleteSupportRequest,
  respondToSupportRequest,
  resolveSupportRequest,
  getSupportStatistics,
  scheduleBackupClass,
  approveBackupClass,
} from "../controllers/supportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize("admin", "teacher"), getSupportRequests)
  .post(authorize("student", "admin"), createSupportRequest);
router
  .route("/statistics")
  .get(authorize("admin", "teacher"), getSupportStatistics);
router
  .route("/:id")
  .get(authorize("admin", "teacher"), getSupportRequestById)
  .put(authorize("admin", "teacher"), updateSupportRequest)
  .delete(authorize("admin", "teacher"), deleteSupportRequest);
router
  .route("/:id/respond")
  .post(authorize("admin", "teacher"), respondToSupportRequest);
router
  .route("/:id/resolve")
  .put(
    authorize("admin", "teacher"),
    upload.single("file"),
    resolveSupportRequest,
  );

router
  .route("/:id/schedule-backup-class")
  .post(authorize("admin", "teacher"), scheduleBackupClass);
router
  .route("/:id/approve-backup-class")
  .put(authorize("admin"), approveBackupClass);

export default router;
