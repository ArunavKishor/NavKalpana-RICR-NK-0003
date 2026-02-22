import express from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentBatches,
  enrollStudentInBatch,
  unenrollStudentFromBatch,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin", "teacher"));

router.route("/").get(getStudents).post(createStudent);
router.route("/:id").get(getStudentById).put(updateStudent).delete(deleteStudent);
router.route("/:id/batches").get(getStudentBatches);
router.route("/:id/enroll").post(enrollStudentInBatch);
router.route("/:id/unenroll").delete(unenrollStudentFromBatch);

export default router;
