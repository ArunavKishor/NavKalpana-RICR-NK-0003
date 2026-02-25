import Assessment from "../models/assessmentModel.js";
import Submission from "../models/submissionModel.js";
import Batch from "../models/batchModel.js";
import Student from "../models/studentModel.js";
import QuizQuestion from "../models/quizQuestionModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import {
  formatValidationErrors,
  isDuplicateKeyError,
} from "../utils/errors.js";

export const createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      submissionType,
      batch,
      dueDate,
      totalMarks,
      status,
      moduleName,
      lessonName,
      lessonId,
    } = req.body;

    if (dueDate && new Date(dueDate) <= new Date()) {
      return res.status(400).json({
        message: "Due date must be in the future",
      });
    }

    const assessment = await Assessment.create({
      title,
      description,
      type,
      submissionType,
      batch,
      dueDate,
      totalMarks,
      status,
      pdfUrl: req.files?.pdf?.[0]?.path || "",
      imageUrl: req.files?.image?.[0]?.path || "",
      createdBy: req.user._id,
      moduleName,
      lessonName,
      lessonId,
    });

    res.status(201).json({
      message: "Assessment created successfully",
      data: assessment,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "Resource already exists" });
    }
    console.error("Create Assessment Error:", error);
    res.status(500).json({ message: "Failed to create assessment" });
  }
};

export const getAssessments = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { search, batch, type, status, startDate, endDate } = req.query;

    console.log("Get Assessments Query:", req.query);

    const filter = { isActive: true };
    if (type && !["assignment", "quiz"].includes(type)) {
      return res.status(400).json({ message: "Invalid type filter" });
    }
    if (status && !["draft", "published", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (batch) filter.batch = batch;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const total = await Assessment.countDocuments(filter);
    const assessments = await Assessment.find(filter)
      .populate("batch", "name course")
      .populate("createdBy", "fullName email")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit);

    // Attach lightweight submission statistics so clients don't need embedded arrays
    const assessmentIds = assessments.map((a) => a._id);
    const submissions = await Submission.find({
      assessment: { $in: assessmentIds },
    }).select("assessment status submissionStatus");

    const statsByAssessment = {};
    submissions.forEach((sub) => {
      const key = sub.assessment.toString();
      if (!statsByAssessment[key]) {
        statsByAssessment[key] = {
          total: 0,
          submitted: 0,
          lateSubmitted: 0,
          evaluated: 0,
          pending: 0,
        };
      }
      const entry = statsByAssessment[key];
      entry.total += 1;

      const status = sub.status;
      const submissionStatus = sub.submissionStatus;

      if (status === "submitted") {
        entry.submitted += 1;
      } else if (status === "late-submitted") {
        entry.lateSubmitted += 1;
      }

      if (status === "evaluated" || submissionStatus === "evaluated") {
        entry.evaluated += 1;
      }

      // Consider any non‑evaluated submissions as pending
      if (!(status === "evaluated" || submissionStatus === "evaluated")) {
        entry.pending += 1;
      }
    });

    const assessmentsWithStats = assessments.map((a) => {
      const plain = a.toObject();
      const key = a._id.toString();
      return {
        ...plain,
        submissionStats: statsByAssessment[key] || {
          total: 0,
          submitted: 0,
          lateSubmitted: 0,
          evaluated: 0,
          pending: 0,
        },
      };
    });

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Assessments retrieved successfully",
      data: {
        assessments: assessmentsWithStats,
        pagination: paginationMeta,
      },
    });
  } catch (error) {
    console.error("Get Assessments Error:", error);
    res.status(500).json({ message: "Failed to retrieve assessments" });
  }
};

export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("batch", "name course")
      .populate("createdBy", "fullName email");

    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Assessment retrieved successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("Get Assessment Error:", error);
    res.status(500).json({ message: "Failed to retrieve assessment" });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const fields = [
      "title",
      "description",
      "type",
      "batch",
      "dueDate",
      "totalMarks",
      "status",
      "moduleName",
      "lessonName",
      "lessonId",
      "submissionType",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        assessment[field] = req.body[field];
      }
    });

    if (req.file) {
      assessment.pdfUrl = req.file.path;
    }

    await assessment.save();

    res.status(200).json({
      message: "Assessment updated successfully",
      data: assessment,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Update Assessment Error:", error);
    res.status(500).json({ message: "Failed to update assessment" });
  }
};

// ============================
// Quiz Question management
// ============================

export const getQuizQuestions = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive || assessment.type !== "quiz") {
      return res.status(404).json({ message: "Quiz assessment not found" });
    }

    const questions = await QuizQuestion.find({
      assessment: assessment._id,
      isActive: true,
    }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      message: "Quiz questions retrieved successfully",
      data: { questions },
    });
  } catch (error) {
    console.error("Get Quiz Questions Error:", error);
    res.status(500).json({ message: "Failed to retrieve quiz questions" });
  }
};

export const upsertQuizQuestions = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive || assessment.type !== "quiz") {
      return res.status(404).json({ message: "Quiz assessment not found" });
    }

    const questionsInput = Array.isArray(req.body)
      ? req.body
      : req.body.questions || [];

    if (!questionsInput.length) {
      return res.status(400).json({
        message: "At least one question is required",
      });
    }

    const createdOrUpdated = [];

    for (let index = 0; index < questionsInput.length; index += 1) {
      const q = questionsInput[index];
      const payload = {
        assessment: assessment._id,
        prompt: q.prompt,
        options: q.options,
        marks: q.marks ?? 1,
        order: q.order ?? index,
        isActive: q.isActive !== false,
        explanation: q.explanation ?? "",
      };

      if (q._id) {
        const updated = await QuizQuestion.findOneAndUpdate(
          { _id: q._id, assessment: assessment._id },
          payload,
          { new: true },
        );
        if (updated) createdOrUpdated.push(updated);
      } else {
        const created = await QuizQuestion.create(payload);
        createdOrUpdated.push(created);
      }
    }

    res.status(200).json({
      message: "Quiz questions saved successfully",
      data: { questions: createdOrUpdated },
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Upsert Quiz Questions Error:", error);
    res.status(500).json({ message: "Failed to save quiz questions" });
  }
};

export const deleteQuizQuestion = async (req, res) => {
  try {
    const question = await QuizQuestion.findById(req.params.questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    question.isActive = false;
    await question.save();

    res.status(200).json({
      message: "Quiz question deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete Quiz Question Error:", error);
    res.status(500).json({ message: "Failed to delete quiz question" });
  }
};

// ============================
// Quiz Attempts (student side)
// ============================

export const submitQuizAttempt = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive || assessment.type !== "quiz") {
      return res.status(404).json({ message: "Quiz assessment not found" });
    }

    const { studentId, answers } = req.body;
    if (!studentId || !Array.isArray(answers) || !answers.length) {
      return res.status(400).json({
        message: "studentId and answers are required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Student not found" });
    }

    const batch = await Batch.findById(assessment.batch);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    const isEnrolled = batch.students.some(
      (id) => id.toString() === student._id.toString(),
    );
    if (!isEnrolled) {
      return res
        .status(400)
        .json({ message: "Student is not enrolled in this batch" });
    }

    // Enforce maxAttempts if set
    if (assessment.maxAttempts) {
      const existingAttempts = await QuizAttempt.countDocuments({
        assessment: assessment._id,
        student: student._id,
      });
      if (existingAttempts >= assessment.maxAttempts) {
        return res.status(400).json({
          message: `Attempt limit reached. This quiz allows a maximum of ${assessment.maxAttempts} attempt(s).`,
        });
      }
    }

    const questions = await QuizQuestion.find({
      assessment: assessment._id,
      isActive: true,
    }).sort({ order: 1, createdAt: 1 });

    if (!questions.length) {
      return res.status(400).json({
        message: "Quiz has no questions configured",
      });
    }

    let totalMarks = 0;
    let score = 0;
    const answerDocs = [];

    questions.forEach((question) => {
      const provided = answers.find(
        (a) => String(a.questionId) === String(question._id),
      );
      const marksForQuestion = question.marks ?? 1;
      totalMarks += marksForQuestion;

      if (!provided) {
        answerDocs.push({
          question: question._id,
          selectedIndex: -1,
          isCorrect: false,
          awardedMarks: 0,
        });
        return;
      }

      const selectedIndex = provided.selectedIndex ?? -1;
      const isCorrectOption =
        selectedIndex >= 0 &&
        question.options?.[selectedIndex] &&
        question.options[selectedIndex].isCorrect;

      const awardedMarks = isCorrectOption ? marksForQuestion : 0;
      score += awardedMarks;

      answerDocs.push({
        question: question._id,
        selectedIndex,
        isCorrect: !!isCorrectOption,
        awardedMarks,
      });
    });

    const attempt = await QuizAttempt.create({
      assessment: assessment._id,
      student: student._id,
      batch: batch._id,
      answers: answerDocs,
      totalMarks,
      score,
      completedAt: new Date(),
      status: "evaluated",
    });

    // Also write a Submission record so existing analytics includes quiz scores
    await Submission.create({
      student: student._id,
      assessment: assessment._id,
      submittedAt: attempt.completedAt,
      marksObtained: score,
      status: "evaluated",
      submissionStatus: "evaluated",
      isLateSubmission: attempt.completedAt > assessment.dueDate,
    });

    res.status(201).json({
      message: "Quiz attempt submitted successfully",
      data: {
        attempt,
        totalMarks,
        score,
      },
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Submit Quiz Attempt Error:", error);
    res.status(500).json({ message: "Failed to submit quiz attempt" });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    assessment.isActive = false;
    await assessment.save();

    res.status(200).json({
      message: "Assessment deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete Assessment Error:", error);
    res.status(500).json({ message: "Failed to delete assessment" });
  }
};

export const getAssessmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assessment: req.params.id,
    })
      .populate({
        path: "student",
        populate: { path: "user", select: "fullName email" },
      })
      .populate("gradedBy", "fullName email");

    res.status(200).json({
      message: "Submissions retrieved successfully",
      data: { submissions },
    });
  } catch (error) {
    console.error("Get Submissions Error:", error);
    res.status(500).json({ message: "Failed to retrieve submissions" });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const { studentId, submittedAt } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }
    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const batch = await Batch.findById(assessment.batch);
    const isEnrolled = batch.students.some(
      (id) => id.toString() === student._id.toString(),
    );
    if (!isEnrolled) {
      return res
        .status(400)
        .json({ message: "Student is not enrolled in this batch" });
    }

    const submissionDate = submittedAt ? new Date(submittedAt) : new Date();
    const isLateSubmission = submissionDate > assessment.dueDate;
    const status = isLateSubmission ? "late-submitted" : "submitted";

    const submission = await Submission.create({
      student: student._id,
      assessment: assessment._id,
      submittedAt: submissionDate,
      fileUrl: req.file ? req.file.path : req.body.fileUrl,
      fileType: req.body.fileType,
      isLateSubmission,
      status,
    });

    res.status(201).json({
      message: "Assessment submitted successfully",
      data: submission,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "Resource already exists" });
    }
    console.error("Submit Assessment Error:", error);
    res.status(500).json({ message: "Failed to submit assessment" });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const { marksObtained, feedback } = req.body;
    if (marksObtained === undefined || marksObtained === null) {
      return res.status(400).json({ message: "marksObtained is required" });
    }
    if (marksObtained > assessment.totalMarks) {
      return res
        .status(400)
        .json({ message: "Marks obtained cannot exceed total marks" });
    }

    submission.marksObtained = marksObtained;
    if (feedback !== undefined) submission.feedback = feedback;
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    submission.status = "evaluated";
    await submission.save();

    res.status(200).json({
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Grade Submission Error:", error);
    res.status(500).json({ message: "Failed to grade submission" });
  }
};

export const evaluateSubmission = async (req, res) => {
  try {
    const { id, submissionId } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({ message: "marks is required" });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (marks > assessment.totalMarks) {
      return res.status(400).json({
        message: `Marks cannot exceed ${assessment.totalMarks}`,
      });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.marksObtained = marks;
    submission.feedback = feedback || "";
    submission.submissionStatus = "evaluated";
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    await submission.save();

    // Rebuild weekly snapshot for this student so analytics/leaderboard stay in sync
    try {
      const { buildWeeklySnapshotsForStudent } =
        await import("./analyticsController.js");
      await buildWeeklySnapshotsForStudent(submission.student.toString(), 8);
    } catch (innerErr) {
      console.error("evaluateSubmission snapshot rebuild failed:", innerErr);
    }

    res.status(200).json({
      message: "Submission evaluated successfully",
      data: submission,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Evaluate Submission Error:", error);
    res.status(500).json({ message: "Failed to evaluate submission" });
  }
};

export const getAssessmentStatistics = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const submissions = await Submission.find({
      assessment: assessment._id,
    });
    const submissionCount = submissions.length;
    const totalMarks = submissions.reduce(
      (sum, s) => sum + (s.marksObtained || 0),
      0,
    );
    const averageMarks =
      submissionCount === 0 ? 0 : totalMarks / submissionCount;

    const batch = await Batch.findById(assessment.batch);
    const enrolledCount = batch ? batch.students.length : 0;
    const completionPercentage =
      enrolledCount === 0 ? 0 : (submissionCount / enrolledCount) * 100;

    res.status(200).json({
      message: "Assessment statistics retrieved successfully",
      data: {
        submissionCount,
        averageMarks,
        completionPercentage,
      },
    });
  } catch (error) {
    console.error("Get Assessment Statistics Error:", error);
    res.status(500).json({ message: "Failed to retrieve assessment stats" });
  }
};
