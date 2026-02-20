import express from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.route("/")
  .get(getTeachers)
  .post(createTeacher);

router.route("/:id")
  .get(getTeacherById)
  .put(updateTeacher)
  .delete(deleteTeacher);

export default router;
