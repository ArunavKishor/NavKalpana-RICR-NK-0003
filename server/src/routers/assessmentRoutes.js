import express from "express";
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getAssessmentSubmissions,
  submitAssessment,
  gradeSubmission,
  getAssessmentStatistics,
} from "../controllers/assessmentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize("admin", "teacher"), getAssessments)
  .post(authorize("admin", "teacher"), createAssessment);
router
  .route("/:id")
  .get(authorize("admin", "teacher"), getAssessmentById)
  .put(authorize("admin", "teacher"), updateAssessment)
  .delete(authorize("admin", "teacher"), deleteAssessment);
router
  .route("/:id/submissions")
  .get(authorize("admin", "teacher"), getAssessmentSubmissions);
router
  .route("/:id/submit")
  .post(authorize("student", "admin", "teacher"), submitAssessment);
router
  .route("/:id/grade/:submissionId")
  .put(authorize("admin", "teacher"), gradeSubmission);
router
  .route("/:id/statistics")
  .get(authorize("admin", "teacher"), getAssessmentStatistics);

export default router;
