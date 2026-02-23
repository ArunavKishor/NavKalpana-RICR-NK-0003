import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  uploadProfilePhoto,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.route("/").get(getTeachers).post(createTeacher);

router
  .route("/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

router
  .route("/:id/upload-photo")
  .post(upload.single("file"), uploadProfilePhoto);

export default router;
