import mongoose from "mongoose";
import Assessment from "../models/assessmentModel.js";
import Submission from "../models/submissionModel.js";
import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the student record associated with this user
    const student = await Student.findOne({ user: userId }).populate('batches');

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const batchIds = student.batches.map(b => b._id);

    // 1. Calculate Attendance
    const attendanceRecords = await Attendance.find({ student: student._id });
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === "present" || r.status === "late").length;
    const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // 2. Fetch Assessments (Assignments and Quizzes)
    const activeAssessments = await Assessment.find({
      batch: { $in: batchIds },
      status: "published",
    });

    // 3. Fetch Submissions by this student
    const submissions = await Submission.find({ student: student._id });
    const submittedAssessmentIds = submissions.map(sub => sub.assessment.toString());

    // 4. Calculate Pending Assignments and Quizzes
    const pendingAssignments = activeAssessments.filter(
      a => a.type === "assignment" && !submittedAssessmentIds.includes(a._id.toString())
    );

    const upcomingQuizzes = activeAssessments.filter(
      a => a.type === "quiz" && !submittedAssessmentIds.includes(a._id.toString())
    );

    res.status(200).json({
      message: "Student dashboard data retrieved successfully",
      data: {
        student: {
          id: student._id,
          name: req.user.fullName,
          enrollmentId: student.enrollmentId,
          attendance: attendancePercentage,
          pendingAssignmentsCount: pendingAssignments.length,
          upcomingQuizzesCount: upcomingQuizzes.length
        },
        pendingAssignments: pendingAssignments.slice(0, 5), // Only send nearest 5
        upcomingQuizzes: upcomingQuizzes.slice(0, 5)
      }
    });

  } catch (error) {
    console.error("Get Student Dashboard Error:", error);
    res.status(500).json({ message: "Failed to retrieve student dashboard" });
  }
};
