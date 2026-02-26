import express from "express";
import {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  getBatchAttendance,
  uploadCoverImage,
} from "../controllers/batchController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  cacheMiddleware,
  setHttpCacheHeaders,
} from "../middlewares/cacheMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/* ✅ Secure routes */
router.use(protect, authorize("admin", "teacher"));
router.use(setHttpCacheHeaders(false, 300)); // 5 minutes cache for authenticated users

router
  .route("/")
  .get(cacheMiddleware("batches:list", 300), getBatches)
  .post(upload.single("image"), createBatch);

router
  .route("/:id")
  .get(cacheMiddleware("batches:detail", 300), getBatchById)
  .put(upload.single("image"), updateBatch)
  .delete(deleteBatch);

router
  .route("/:id/students")
  .get(cacheMiddleware("batches:students", 300), getBatchStudents);
router
  .route("/:id/attendance")
  .get(cacheMiddleware("batches:attendance", 300), getBatchAttendance);

router.route("/:id/upload-cover").post(upload.single("file"), uploadCoverImage);

export default router;
