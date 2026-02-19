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
  .get(authorize("admin"), getAssessments)
  .post(authorize("admin"), createAssessment);
router
  .route("/:id")
  .get(authorize("admin"), getAssessmentById)
  .put(authorize("admin"), updateAssessment)
  .delete(authorize("admin"), deleteAssessment);
router
  .route("/:id/submissions")
  .get(authorize("admin"), getAssessmentSubmissions);
router
  .route("/:id/submit")
  .post(authorize("student", "admin"), submitAssessment);
router
  .route("/:id/grade/:submissionId")
  .put(authorize("admin"), gradeSubmission);
router
  .route("/:id/statistics")
  .get(authorize("admin"), getAssessmentStatistics);

export default router;
