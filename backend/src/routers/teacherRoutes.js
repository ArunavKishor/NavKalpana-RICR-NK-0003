import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  getMeTeacher,
  updateTeacher,
  deleteTeacher,
  uploadProfilePhoto,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// Get current teacher profile - accessible by teacher
router.route("/me").get(authorize("teacher"), getMeTeacher);

// Get teachers - accessible by admin and teacher
router.route("/").get(authorize("admin", "teacher"), getTeachers);

// Create teacher - admin only
router.route("/").post(authorize("admin"), createTeacher);

router
  .route("/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

router
  .route("/:id/upload-photo")
  .post(upload.single("file"), uploadProfilePhoto);

export default router;
