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
    const attendanceRecords = await Attendance.find({ student: student._id })
      .populate("batch", "name")
      .sort({ date: -1 });

    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === "present").length;
    const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
    const lateCount = attendanceRecords.filter(r => r.status === "late").length;
    const attendancePercentage = totalSessions > 0
      ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
      : 0;

    // Recent attendance records (last 10)
    const recentAttendance = attendanceRecords.slice(0, 10).map(r => ({
      date: r.date,
      status: r.status,
      batch: r.batch?.name || "N/A",
    }));

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
          presentCount,
          absentCount,
          lateCount,
          totalSessions,
          pendingAssignmentsCount: pendingAssignments.length,
          upcomingQuizzesCount: upcomingQuizzes.length
        },
        recentAttendance,
        pendingAssignments: pendingAssignments.slice(0, 5), // Only send nearest 5
        upcomingQuizzes: upcomingQuizzes.slice(0, 5)
      }
    });

  } catch (error) {
    console.error("Get Student Dashboard Error:", error);
    res.status(500).json({ message: "Failed to retrieve student dashboard" });
  }
};
