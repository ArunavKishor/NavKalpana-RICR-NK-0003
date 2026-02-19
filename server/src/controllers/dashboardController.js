import Student from "../models/studentModel.js";
import Batch from "../models/batchModel.js";
import Assessment from "../models/assessmentModel.js";
import Attendance from "../models/attendanceModel.js";
import Submission from "../models/submissionModel.js";
import SupportRequest from "../models/supportRequestModel.js";

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const activeBatches = await Batch.countDocuments({
      isActive: true,
      status: "ongoing",
    });
    const pendingAssessments = await Assessment.countDocuments({
      isActive: true,
      status: "published",
      dueDate: { $gt: new Date() },
    });

    const openRequests = await SupportRequest.countDocuments({
      status: "open",
    });

    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      data: {
        totalStudents,
        activeBatches,
        pendingAssessments,
        openSupportRequests: openRequests,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to retrieve dashboard stats" });
  }
};

export const getPerformanceAnalytics = async (req, res) => {
  try {
    const fromDate = daysAgo(42);
    const attendanceRecords = await Attendance.find({
      date: { $gte: fromDate },
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    const averageAttendancePercentage =
      totalAttendance === 0 ? 0 : (presentCount / totalAttendance) * 100;

    const submissions = await Submission.find({
      submittedAt: { $gte: fromDate },
      marksObtained: { $ne: null },
    });
    const totalScores = submissions.reduce(
      (sum, submission) => sum + (submission.marksObtained || 0),
      0,
    );
    const averageAssessmentScore =
      submissions.length === 0 ? 0 : totalScores / submissions.length;

    const students = await Student.find({ isActive: true }).populate(
      "user",
      "fullName email",
    );
    const studentAttendance = await Attendance.find({
      date: { $gte: fromDate },
    });
    const studentSubmissions = await Submission.find({
      submittedAt: { $gte: fromDate },
      marksObtained: { $ne: null },
    });

    const studentPerformance = students.map((student) => {
      const records = studentAttendance.filter(
        (r) => r.student.toString() === student._id.toString(),
      );
      const total = records.length;
      const attended = records.filter(
        (r) => r.status === "present" || r.status === "late",
      ).length;
      const attendancePercentage =
        total === 0 ? 0 : Number(((attended / total) * 100).toFixed(2));

      const submissionsForStudent = studentSubmissions.filter(
        (s) => s.student.toString() === student._id.toString(),
      );
      const avgScore =
        submissionsForStudent.length === 0
          ? 0
          : submissionsForStudent.reduce(
              (sum, s) => sum + (s.marksObtained || 0),
              0,
            ) / submissionsForStudent.length;

      return {
        student: {
          id: student._id,
          fullName: student.user?.fullName,
          email: student.user?.email,
        },
        attendancePercentage,
        averageAssessmentScore: avgScore,
      };
    });

    res.status(200).json({
      message: "Performance analytics retrieved successfully",
      data: {
        averageAttendancePercentage,
        averageAssessmentScore,
        studentPerformance,
      },
    });
  } catch (error) {
    console.error("Get Performance Analytics Error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve performance analytics" });
  }
};

export const getUpcomingDeadlines = async (req, res) => {
  try {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(now.getDate() + 7);

    const assessments = await Assessment.find({
      isActive: true,
      dueDate: { $gte: now, $lte: inSevenDays },
    })
      .populate("batch", "name course")
      .sort({ dueDate: 1 });

    res.status(200).json({
      message: "Upcoming deadlines retrieved successfully",
      data: { assessments },
    });
  } catch (error) {
    console.error("Get Upcoming Deadlines Error:", error);
    res.status(500).json({ message: "Failed to retrieve deadlines" });
  }
};

export const getTrends = async (req, res) => {
  try {
    const fromDate = daysAgo(42);
    const attendanceRecords = await Attendance.find({
      date: { $gte: fromDate },
    });
    const submissions = await Submission.find({
      submittedAt: { $gte: fromDate },
      marksObtained: { $ne: null },
    });

    const attendanceByWeek = attendanceRecords.reduce((acc, record) => {
      const week = getWeekStart(record.date);
      if (!acc[week]) acc[week] = { total: 0, attended: 0 };
      acc[week].total += 1;
      if (record.status === "present" || record.status === "late") {
        acc[week].attended += 1;
      }
      return acc;
    }, {});

    const scoreByWeek = submissions.reduce((acc, submission) => {
      const week = getWeekStart(submission.submittedAt);
      if (!acc[week]) acc[week] = { total: 0, count: 0 };
      acc[week].total += submission.marksObtained || 0;
      acc[week].count += 1;
      return acc;
    }, {});

    const weeks = Array.from(
      new Set([
        ...Object.keys(attendanceByWeek),
        ...Object.keys(scoreByWeek),
      ]),
    ).sort();

    const trends = weeks.map((week) => {
      const attendance = attendanceByWeek[week] || { total: 0, attended: 0 };
      const scores = scoreByWeek[week] || { total: 0, count: 0 };
      const attendancePercentage =
        attendance.total === 0
          ? 0
          : Number(((attendance.attended / attendance.total) * 100).toFixed(2));
      const averageScore =
        scores.count === 0 ? 0 : scores.total / scores.count;
      return {
        week,
        attendancePercentage,
        averageScore,
      };
    });

    res.status(200).json({
      message: "Trends retrieved successfully",
      data: { trends },
    });
  } catch (error) {
    console.error("Get Trends Error:", error);
    res.status(500).json({ message: "Failed to retrieve trends" });
  }
};
