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
  evaluateSubmission,
  getQuizQuestions,
  upsertQuizQuestions,
  deleteQuizQuestion,
  submitQuizAttempt,
} from "../controllers/assessmentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(authorize("admin", "teacher"), getAssessments)
  .post(
    authorize("admin", "teacher"),
    upload.fields([
      { name: "pdf", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    createAssessment,
  );
router
  .route("/:id")
  .get(authorize("admin", "teacher"), getAssessmentById)
  .put(
    authorize("admin", "teacher"),
    upload.fields([
      { name: "pdf", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
    updateAssessment,
  )
  .delete(authorize("admin", "teacher"), deleteAssessment);
router
  .route("/:id/submissions")
  .get(authorize("admin", "teacher"), getAssessmentSubmissions);
router
  .route("/:id/submit")
  .post(authorize("admin", "teacher"), upload.single("file"), submitAssessment);
// Quiz-specific routes
router
  .route("/:id/questions")
  .get(authorize("admin", "teacher"), getQuizQuestions)
  .post(authorize("admin", "teacher"), upsertQuizQuestions);
router
  .route("/:id/questions/:questionId")
  .delete(authorize("admin", "teacher"), deleteQuizQuestion);
router.route("/:id/attempts").post(submitQuizAttempt);
router
  .route("/:id/grade/:submissionId")
  .put(authorize("admin", "teacher"), gradeSubmission);
router
  .route("/:id/submissions/:submissionId/evaluate")
  .post(authorize("admin", "teacher"), evaluateSubmission);
router
  .route("/:id/statistics")
  .get(authorize("admin", "teacher"), getAssessmentStatistics);

export default router;
