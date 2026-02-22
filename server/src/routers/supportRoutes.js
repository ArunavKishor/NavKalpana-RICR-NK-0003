import express from "express";
import {
  createSupportRequest,
  getSupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  respondToSupportRequest,
  resolveSupportRequest,
  getSupportStatistics,
} from "../controllers/supportController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(authorize("admin"), getSupportRequests).post(
  authorize("student", "admin"),
  createSupportRequest,
);
router
  .route("/statistics")
  .get(authorize("admin"), getSupportStatistics);
router
  .route("/:id")
  .get(authorize("admin"), getSupportRequestById)
  .put(authorize("admin"), updateSupportRequest);
router
  .route("/:id/respond")
  .post(authorize("admin"), respondToSupportRequest);
router
  .route("/:id/resolve")
  .put(authorize("admin"), resolveSupportRequest);

export default router;
