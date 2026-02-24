import Assessment from "../models/assessmentModel.js";
import Submission from "../models/submissionModel.js";
import Batch from "../models/batchModel.js";
import Student from "../models/studentModel.js";
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
      questions,
      duration,
      attemptLimit,
    } = req.body;

    if (dueDate && new Date(dueDate) <= new Date()) {
      return res.status(400).json({
        message: "Due date must be in the future",
      });
    }

    // Build assessment data
    const assessmentData = {
      title,
      description,
      type,
      submissionType,
      batch,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      totalMarks: totalMarks ? Number(totalMarks) : 0,
      status: status || "published",
      pdfUrl: req.file ? req.file.path : "",
      createdBy: req.user._id,
    };

    // Add quiz-specific fields
    if (type === "quiz") {
      // Questions might be a string due to multipart form data
      if (questions) {
        assessmentData.questions = typeof questions === 'string' ? JSON.parse(questions) : questions;
      }
      if (duration) assessmentData.duration = Number(duration);
      if (attemptLimit) assessmentData.attemptLimit = Number(attemptLimit);
    }

    const assessment = await Assessment.create(assessmentData);

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
    res.status(500).json({
      message: "Failed to create assessment",
      error: error.message
    });
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

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Assessments retrieved successfully",
      data: {
        assessments,
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
      "questions",
      "duration",
      "attemptLimit",
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

    const { studentId, submittedAt, answers } = req.body;
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

    // Check attempt limit for quizzes
    if (assessment.type === "quiz") {
      const submissionCount = await Submission.countDocuments({
        student: student._id,
        assessment: assessment._id,
      });
      if (submissionCount >= assessment.attemptLimit) {
        return res.status(400).json({
          message: `Maximum ${assessment.attemptLimit} attempt(s) allowed for this quiz`,
        });
      }

      // Validate answers are provided for quiz
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Quiz answers are required" });
      }
    }

    const submissionDate = submittedAt ? new Date(submittedAt) : new Date();
    const isLateSubmission = submissionDate > assessment.dueDate;
    const status = isLateSubmission ? "late-submitted" : "submitted";

    const submissionData = {
      student: student._id,
      assessment: assessment._id,
      submittedAt: submissionDate,
      isLateSubmission,
      status,
    };

    // Handle quiz submission with auto-grading
    if (assessment.type === "quiz" && answers) {
      submissionData.answers = [];
      let correctCount = 0;

      for (const answer of answers) {
        const question = assessment.questions.find(
          (q) => q._id.toString() === answer.questionId,
        );
        if (!question) {
          return res.status(400).json({
            message: `Question ${answer.questionId} not found in assessment`,
          });
        }

        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;

        submissionData.answers.push({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
        });
      }

      // Calculate marks: (correctCount / totalQuestions) * totalMarks
      const totalQuestions = assessment.questions.length || 1;
      const marksPerQuestion = assessment.totalMarks / totalQuestions;
      submissionData.marksObtained = Math.round(
        correctCount * marksPerQuestion,
      );

      // Auto-mark as evaluated for quizzes
      submissionData.status = status;
    } else {
      // Handle file submission for assignments
      submissionData.fileUrl = req.file
        ? req.file.path
        : req.body.fileUrl || "";
      submissionData.fileType = req.body.fileType || "PDF";
    }

    const submission = await Submission.create(submissionData);

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
      return res.status(409).json({
        message: "You have already submitted this assessment",
      });
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
    submission.status = "evaluated";
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    await submission.save();

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
