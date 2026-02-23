import express from "express";
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  getBatchAttendance,
} from "../controllers/batchController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "teacher"));

router.route("/").get(getBatches).post(upload.single("image"), createBatch);
router.route("/:id").get(getBatchById).put(upload.single("image"), updateBatch).delete(deleteBatch);
router.route("/:id/students").get(getBatchStudents);
router.route("/:id/attendance").get(getBatchAttendance);

export default router;
