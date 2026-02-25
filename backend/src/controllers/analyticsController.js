import mongoose from "mongoose";
import Attendance from "../models/attendanceModel.js";
import Submission from "../models/submissionModel.js";
import Assessment from "../models/assessmentModel.js";
import Batch from "../models/batchModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import WeeklySnapshot from "../models/weeklySnapshotModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";

const DAYS_WINDOW = 42; // keep in sync with dashboard trends

const getDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Shared OGI formula – MUST match student portal logic:
// 40% attendance, 60% academic performance
const computeOgi = (attendancePercentage, averageGrade) => {
  const att = Number(attendancePercentage || 0);
  const grade = Number(averageGrade || 0);
  return Number((att * 0.4 + grade * 0.6).toFixed(2));
};

const computeGrowthClassification = (ogiTrend = []) => {
  if (!ogiTrend.length) return "Needs Attention";
  const latest = ogiTrend[ogiTrend.length - 1]?.ogi || 0;
  const previous = ogiTrend[ogiTrend.length - 2]?.ogi ?? latest;
  const delta = latest - previous;

  if (latest >= 80 && delta >= 5) return "Excellent";
  if (delta >= 3) return "Improving";
  if (Math.abs(delta) < 3) return "Stable";
  return "Needs Attention";
};

const computeLearningStreak = (ogiTrend = []) => {
  let streak = 0;
  for (let i = ogiTrend.length - 1; i >= 0; i -= 1) {
    if ((ogiTrend[i]?.ogi || 0) >= 60) streak += 1;
    else break;
  }
  return streak;
};

// Builds (and upserts) snapshots for the given student for the last N weeks.
// Returns the snapshots sorted by weekStart.
const buildWeeklySnapshotsForStudent = async (studentId, weeks = 8) => {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);
  const earliestDate = getDaysAgo(DAYS_WINDOW);

  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const attendanceRecords = await Attendance.find({
    student: studentObjectId,
    date: { $gte: earliestDate },
  });

  const submissions = await Submission.find({
    student: studentObjectId,
    submittedAt: { $gte: earliestDate },
    marksObtained: { $ne: null },
  }).populate("assessment", "type totalMarks batch dueDate");

  const quizAttempts = await QuizAttempt.find({
    student: studentObjectId,
    startedAt: { $gte: earliestDate },
    status: { $in: ["submitted", "evaluated"] },
  }).populate("assessment", "type totalMarks batch dueDate");

  const weeklyMap = new Map();

  // Attendance per week
  for (const record of attendanceRecords) {
    const key = getWeekStart(record.date).toISOString();
    if (!weeklyMap.has(key)) {
      weeklyMap.set(key, {
        attendanceTotal: 0,
        attendancePresent: 0,
        attendanceLate: 0,
        attendanceAbsent: 0,
        quizScores: [],
        assignmentScores: [],
        expectedAssessments: 0,
        completedAssessments: 0,
      });
    }
    const week = weeklyMap.get(key);
    week.attendanceTotal += 1;
    if (record.status === "present") week.attendancePresent += 1;
    if (record.status === "late") week.attendanceLate += 1;
    if (record.status === "absent") week.attendanceAbsent += 1;
  }

  // Submissions per week
  for (const submission of submissions) {
    if (!submission.assessment) continue;
    const weekKey = getWeekStart(submission.submittedAt).toISOString();
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        attendanceTotal: 0,
        attendancePresent: 0,
        attendanceLate: 0,
        attendanceAbsent: 0,
        quizScores: [],
        assignmentScores: [],
        expectedAssessments: 0,
        completedAssessments: 0,
      });
    }
    const week = weeklyMap.get(weekKey);
    const totalMarks = submission.assessment.totalMarks || 0;
    if (!totalMarks || submission.marksObtained == null) continue;
    const pct = (submission.marksObtained / totalMarks) * 100;
    if (submission.assessment.type === "quiz") {
      week.quizScores.push(pct);
    } else if (submission.assessment.type === "assignment") {
      week.assignmentScores.push(pct);
    }
    week.completedAssessments += 1;
  }

  // QuizAttempts per week
  for (const attempt of quizAttempts) {
    if (!attempt.assessment) continue;
    const weekKey = getWeekStart(
      attempt.startedAt || attempt.completedAt,
    ).toISOString();
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        attendanceTotal: 0,
        attendancePresent: 0,
        attendanceLate: 0,
        attendanceAbsent: 0,
        quizScores: [],
        assignmentScores: [],
        expectedAssessments: 0,
        completedAssessments: 0,
      });
    }
    const week = weeklyMap.get(weekKey);
    const totalMarks = attempt.assessment.totalMarks || attempt.totalMarks || 0;
    if (!totalMarks || attempt.score == null) continue;

    // Convert to percentage
    const pct = (attempt.score / totalMarks) * 100;
    week.quizScores.push(pct);
    week.completedAssessments += 1;
  }

  // For completion/submission consistency we approximate using counts
  // of assessments assigned to the student's batches in the same weeks.
  // This keeps behaviour consistent with the rest of the portal (per‑assessment completion).
  const existingSnapshots = [];
  const result = [];

  const sortedWeekKeys = Array.from(weeklyMap.keys()).sort();
  const limitedWeekKeys = sortedWeekKeys.slice(
    Math.max(0, sortedWeekKeys.length - weeks),
  );

  for (const weekIso of limitedWeekKeys) {
    const weekStart = new Date(weekIso);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekData = weeklyMap.get(weekIso);

    const totalSessions = weekData.attendanceTotal;
    const attended = weekData.attendancePresent + weekData.attendanceLate;
    const attendancePercentage =
      totalSessions === 0
        ? 0
        : Number(((attended / totalSessions) * 100).toFixed(2));

    const quizAverage =
      weekData.quizScores.length === 0
        ? 0
        : Number(
            (
              weekData.quizScores.reduce((s, v) => s + v, 0) /
              weekData.quizScores.length
            ).toFixed(2),
          );

    const assignmentAverage =
      weekData.assignmentScores.length === 0
        ? 0
        : Number(
            (
              weekData.assignmentScores.reduce((s, v) => s + v, 0) /
              weekData.assignmentScores.length
            ).toFixed(2),
          );

    const overallAcademicAverage =
      weekData.quizScores.length + weekData.assignmentScores.length === 0
        ? 0
        : Number(
            (
              (weekData.quizScores.reduce((s, v) => s + v, 0) +
                weekData.assignmentScores.reduce((s, v) => s + v, 0)) /
              (weekData.quizScores.length + weekData.assignmentScores.length)
            ).toFixed(2),
          );

    const ogi = computeOgi(attendancePercentage, overallAcademicAverage);

    // Simple approximations for completion & consistency using the same base
    const completionRate =
      weekData.completedAssessments === 0
        ? 0
        : Number(Math.min(100, weekData.completedAssessments * 10).toFixed(2));
    const submissionConsistency = completionRate;

    const weeklyLearningHours = Number((attended * 1.5).toFixed(1));
    const skillAcquisitionCount = weekData.completedAssessments;

    const payload = {
      student: studentObjectId,
      weekStart,
      attendancePercentage,
      quizAverage,
      assignmentAverage,
      completionRate,
      submissionConsistency,
      ogi,
      totalSessions,
      presentCount: weekData.attendancePresent,
      lateCount: weekData.attendanceLate,
      absentCount: weekData.attendanceAbsent,
      weeklyLearningHours,
      skillAcquisitionCount,
    };

    const snapshot = await WeeklySnapshot.findOneAndUpdate(
      { student: studentObjectId, weekStart },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    existingSnapshots.push(snapshot);
    result.push(snapshot);
  }

  // Also pull any older snapshots (for long‑term trend) but don't recompute them
  const historical = await WeeklySnapshot.find({
    student: studentObjectId,
    weekStart: { $lt: new Date(limitedWeekKeys[0] || currentWeekStart) },
  })
    .sort({ weekStart: 1 })
    .limit(Math.max(0, weeks - result.length));

  return [...historical, ...result].sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
  );
};

export const getTeacherClassAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { batchId, course } = req.query;

    const teacher = await Teacher.findOne({ user: userId, isActive: true });

    if (!teacher) {
      return res.status(200).json({
        message: "No teacher profile found for user",
        data: {
          classMetrics: {
            averageQuizScore: 0,
            averageAssignmentScore: 0,
            submissionConsistency: 0,
            moduleCompletionRate: 0,
            overallClassOgi: 0,
          },
          moduleAttendanceComparison: [],
          weeklyActivityTrend: [],
          attendanceHeatmap: [],
          students: [],
        },
      });
    }

    const batchFilter = {
      instructor: teacher._id,
      isActive: true,
    };
    if (batchId) batchFilter._id = batchId;
    if (course) batchFilter.course = course;

    const batches = await Batch.find(batchFilter);
    const batchIds = batches.map((b) => b._id);

    if (!batchIds.length) {
      return res.status(200).json({
        message: "No batches found for teacher",
        data: {
          classMetrics: {
            averageQuizScore: 0,
            averageAssignmentScore: 0,
            submissionConsistency: 0,
            moduleCompletionRate: 0,
            overallClassOgi: 0,
          },
          moduleAttendanceComparison: [],
          weeklyActivityTrend: [],
          attendanceHeatmap: [],
          students: [],
        },
      });
    }

    const fromDate = getDaysAgo(DAYS_WINDOW);

    const [
      attendanceRecords,
      assessments,
      submissions,
      quizAttempts,
      students,
    ] = await Promise.all([
      Attendance.find({
        batch: { $in: batchIds },
        date: { $gte: fromDate },
      }),
      Assessment.find({
        batch: { $in: batchIds },
        isActive: true,
      }),
      Submission.find({
        submittedAt: { $gte: fromDate },
        marksObtained: { $ne: null },
      }).populate("assessment", "type totalMarks batch"),
      QuizAttempt.find({
        startedAt: { $gte: fromDate },
        status: { $in: ["submitted", "evaluated"] },
      }).populate("assessment", "type totalMarks batch"),
      Student.find({
        isActive: true,
        batches: { $in: batchIds },
      }).populate("user", "fullName email"),
    ]);

    const assessmentsById = new Map(
      assessments.map((a) => [a._id.toString(), a]),
    );

    const quizScores = [];
    const assignmentScores = [];

    const submissionsByStudent = new Map();
    for (const submission of submissions) {
      const a = submission.assessment;
      if (!a || !assessmentsById.has(a._id.toString())) continue;
      if (!a.totalMarks || submission.marksObtained == null) continue;
      const pct = (submission.marksObtained / a.totalMarks) * 100;

      if (a.type === "quiz") quizScores.push(pct);
      if (a.type === "assignment") assignmentScores.push(pct);

      const key = submission.student.toString();
      if (!submissionsByStudent.has(key)) submissionsByStudent.set(key, []);
      submissionsByStudent.get(key).push({ submission, assessment: a, pct });
    }

    for (const attempt of quizAttempts) {
      const a = attempt.assessment;
      if (!a || !assessmentsById.has(a._id.toString())) continue;
      if (!a.totalMarks || attempt.score == null) continue;
      const pct = (attempt.score / a.totalMarks) * 100;
      quizScores.push(pct);

      const key = attempt.student.toString();
      if (!submissionsByStudent.has(key)) submissionsByStudent.set(key, []);
      submissionsByStudent.get(key).push({ attempt, assessment: a, pct });
    }

    const averageQuizScore =
      quizScores.length === 0
        ? 0
        : Number(
            (
              quizScores.reduce((sum, v) => sum + v, 0) / quizScores.length
            ).toFixed(2),
          );

    const averageAssignmentScore =
      assignmentScores.length === 0
        ? 0
        : Number(
            (
              assignmentScores.reduce((sum, v) => sum + v, 0) /
              assignmentScores.length
            ).toFixed(2),
          );

    // Submission consistency / completion rate approximation
    let expectedSubmissions = 0;
    let actualSubmissions = 0;
    const batchStudentCounts = new Map(
      batches.map((b) => [b._id.toString(), (b.students || []).length]),
    );

    for (const a of assessments) {
      const count = batchStudentCounts.get(a.batch.toString()) || 0;
      expectedSubmissions += count;
    }
    actualSubmissions = submissions.length;

    const submissionConsistency =
      expectedSubmissions === 0
        ? 0
        : Number(((actualSubmissions / expectedSubmissions) * 100).toFixed(2));

    const moduleCompletionRate = submissionConsistency;

    // Module (batch) wise attendance comparison
    const attendanceByBatch = new Map();
    for (const record of attendanceRecords) {
      const key = record.batch.toString();
      if (!attendanceByBatch.has(key)) {
        attendanceByBatch.set(key, {
          batchId: key,
          name: "",
          course: "",
          totalSessions: 0,
          attended: 0,
        });
      }
      const entry = attendanceByBatch.get(key);
      entry.totalSessions += 1;
      if (record.status === "present" || record.status === "late") {
        entry.attended += 1;
      }
    }

    for (const b of batches) {
      const key = b._id.toString();
      if (!attendanceByBatch.has(key)) {
        attendanceByBatch.set(key, {
          batchId: key,
          name: b.name,
          course: b.course,
          totalSessions: 0,
          attended: 0,
        });
      } else {
        const entry = attendanceByBatch.get(key);
        entry.name = b.name;
        entry.course = b.course;
      }
    }

    const moduleAttendanceComparison = Array.from(
      attendanceByBatch.values(),
    ).map((entry) => ({
      batchId: entry.batchId,
      name: entry.name,
      course: entry.course,
      attendancePercentage:
        entry.totalSessions === 0
          ? 0
          : Number(((entry.attended / entry.totalSessions) * 100).toFixed(2)),
    }));

    // Weekly activity trend (per week over the window)
    const weeklyMap = new Map();
    for (const record of attendanceRecords) {
      const key = getWeekStart(record.date).toISOString();
      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, {
          attendanceTotal: 0,
          attendancePresentOrLate: 0,
          quizScores: [],
          assignmentScores: [],
        });
      }
      const w = weeklyMap.get(key);
      w.attendanceTotal += 1;
      if (record.status === "present" || record.status === "late") {
        w.attendancePresentOrLate += 1;
      }
    }

    for (const submission of submissions) {
      const a = submission.assessment;
      if (!a || !a.totalMarks || submission.marksObtained == null) continue;
      const key = getWeekStart(submission.submittedAt).toISOString();
      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, {
          attendanceTotal: 0,
          attendancePresentOrLate: 0,
          quizScores: [],
          assignmentScores: [],
        });
      }
      const w = weeklyMap.get(key);
      const pct = (submission.marksObtained / a.totalMarks) * 100;
      if (a.type === "quiz") w.quizScores.push(pct);
      if (a.type === "assignment") w.assignmentScores.push(pct);
    }

    for (const attempt of quizAttempts) {
      const a = attempt.assessment;
      if (!a || !a.totalMarks || attempt.score == null) continue;
      const key = getWeekStart(
        attempt.startedAt || attempt.completedAt,
      ).toISOString();
      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, {
          attendanceTotal: 0,
          attendancePresentOrLate: 0,
          quizScores: [],
          assignmentScores: [],
        });
      }
      const w = weeklyMap.get(key);
      const pct = (attempt.score / a.totalMarks) * 100;
      w.quizScores.push(pct);
    }

    const weeklyActivityTrend = Array.from(weeklyMap.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([weekIso, data]) => {
        const attendancePercentage =
          data.attendanceTotal === 0
            ? 0
            : Number(
                (
                  (data.attendancePresentOrLate / data.attendanceTotal) *
                  100
                ).toFixed(2),
              );
        const quizAverage =
          data.quizScores.length === 0
            ? 0
            : Number(
                (
                  data.quizScores.reduce((s, v) => s + v, 0) /
                  data.quizScores.length
                ).toFixed(2),
              );
        const assignmentAverage =
          data.assignmentScores.length === 0
            ? 0
            : Number(
                (
                  data.assignmentScores.reduce((s, v) => s + v, 0) /
                  data.assignmentScores.length
                ).toFixed(2),
              );
        const overallAcademicAverage =
          data.quizScores.length + data.assignmentScores.length === 0
            ? 0
            : Number(
                (
                  (data.quizScores.reduce((s, v) => s + v, 0) +
                    data.assignmentScores.reduce((s, v) => s + v, 0)) /
                  (data.quizScores.length + data.assignmentScores.length)
                ).toFixed(2),
              );
        const ogi = computeOgi(attendancePercentage, overallAcademicAverage);

        return {
          week: weekIso,
          attendancePercentage,
          quizAverage,
          assignmentAverage,
          ogi,
        };
      });

    // Attendance heatmap (per date)
    const heatmapByDate = new Map();
    for (const record of attendanceRecords) {
      const key = record.date.toISOString().split("T")[0];
      if (!heatmapByDate.has(key)) {
        heatmapByDate.set(key, {
          date: key,
          totalSessions: 0,
          attended: 0,
        });
      }
      const entry = heatmapByDate.get(key);
      entry.totalSessions += 1;
      if (record.status === "present" || record.status === "late") {
        entry.attended += 1;
      }
    }

    const attendanceHeatmap = Array.from(heatmapByDate.values()).map(
      (entry) => ({
        date: entry.date,
        intensity:
          entry.totalSessions === 0
            ? 0
            : Number(((entry.attended / entry.totalSessions) * 100).toFixed(2)),
      }),
    );

    // Per‑student metrics and growth classification
    const studentsAnalytics = [];
    for (const student of students) {
      const sid = student._id.toString();

      const studentAttendance = attendanceRecords.filter(
        (r) => r.student.toString() === sid,
      );
      const totalSessions = studentAttendance.length;
      const attendedSessions = studentAttendance.filter(
        (r) => r.status === "present" || r.status === "late",
      ).length;
      const attendancePercentage =
        totalSessions === 0
          ? 0
          : Number(((attendedSessions / totalSessions) * 100).toFixed(2));

      const studentSubs = submissionsByStudent.get(sid) || [];
      const academicAverage =
        studentSubs.length === 0
          ? 0
          : Number(
              (
                studentSubs.reduce((s, v) => s + v.pct, 0) / studentSubs.length
              ).toFixed(2),
            );

      const ogi = computeOgi(attendancePercentage, academicAverage);

      const snapshots = await buildWeeklySnapshotsForStudent(sid, 8);
      const ogiTrend = snapshots.map((s) => ({
        weekStart: s.weekStart,
        ogi: s.ogi,
      }));
      const growthClassification = computeGrowthClassification(ogiTrend);
      const learningStreak = computeLearningStreak(ogiTrend);

      const completionRate =
        studentSubs.length === 0
          ? 0
          : Number(Math.min(100, studentSubs.length * 10).toFixed(2));

      const weeklyLearningHours =
        snapshots.length === 0
          ? 0
          : Number(
              (
                snapshots[snapshots.length - 1].weeklyLearningHours || 0
              ).toFixed(1),
            );

      const skillAcquisitionCount =
        snapshots.length === 0
          ? 0
          : snapshots.reduce(
              (sum, s) => sum + (s.skillAcquisitionCount || 0),
              0,
            );

      studentsAnalytics.push({
        id: sid,
        name: student.user?.fullName,
        email: student.user?.email,
        ogi,
        ogiTrend,
        growthClassification,
        moduleCompletionProgress: completionRate,
        weeklyLearningHours,
        skillAcquisitionCount,
        learningStreak,
        attendancePercentage,
        academicAverage,
      });
    }

    const overallClassOgi =
      studentsAnalytics.length === 0
        ? 0
        : Number(
            (
              studentsAnalytics.reduce((s, st) => s + (st.ogi || 0), 0) /
              studentsAnalytics.length
            ).toFixed(2),
          );

    res.status(200).json({
      message: "Teacher class analytics retrieved successfully",
      data: {
        classMetrics: {
          averageQuizScore,
          averageAssignmentScore,
          submissionConsistency,
          moduleCompletionRate,
          overallClassOgi,
        },
        moduleAttendanceComparison,
        weeklyActivityTrend,
        attendanceHeatmap,
        students: studentsAnalytics,
      },
    });
  } catch (error) {
    console.error("Get Teacher Class Analytics Error:", error);
    res.status(500).json({
      message: "Failed to retrieve teacher class analytics",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { batchId, course, sortBy = "ogi", order = "desc" } = req.query;

    const teacher = await Teacher.findOne({ user: userId, isActive: true });

    if (!teacher) {
      return res.status(200).json({
        message: "No teacher profile found for user",
        data: { leaderboard: [] },
      });
    }

    const batchFilter = {
      instructor: teacher._id,
      isActive: true,
    };
    if (batchId) batchFilter._id = batchId;
    if (course) batchFilter.course = course;

    const batches = await Batch.find(batchFilter);
    const batchIds = batches.map((b) => b._id);

    if (!batchIds.length) {
      return res.status(200).json({
        message: "No batches found for leaderboard",
        data: { leaderboard: [] },
      });
    }

    const fromDate = getDaysAgo(DAYS_WINDOW);

    const [attendanceRecords, submissions, students] = await Promise.all([
      Attendance.find({
        batch: { $in: batchIds },
        date: { $gte: fromDate },
      }),
      Submission.find({
        submittedAt: { $gte: fromDate },
        marksObtained: { $ne: null },
      }).populate("assessment", "type totalMarks batch"),
      Student.find({
        isActive: true,
        batches: { $in: batchIds },
      }).populate("user", "fullName email"),
    ]);

    const submissionsByStudent = new Map();
    for (const submission of submissions) {
      const a = submission.assessment;
      if (!a || !a.totalMarks || submission.marksObtained == null) continue;
      const pct = (submission.marksObtained / a.totalMarks) * 100;
      const key = submission.student.toString();
      if (!submissionsByStudent.has(key)) submissionsByStudent.set(key, []);
      submissionsByStudent.get(key).push({ submission, assessment: a, pct });
    }

    const leaderboard = [];
    for (const student of students) {
      const sid = student._id.toString();
      const studentAttendance = attendanceRecords.filter(
        (r) => r.student.toString() === sid,
      );
      const totalSessions = studentAttendance.length;
      const attendedSessions = studentAttendance.filter(
        (r) => r.status === "present" || r.status === "late",
      ).length;
      const attendancePercentage =
        totalSessions === 0
          ? 0
          : Number(((attendedSessions / totalSessions) * 100).toFixed(2));

      const studentSubs = submissionsByStudent.get(sid) || [];
      const assignmentSubs = studentSubs.filter(
        (s) => s.assessment.type === "assignment",
      );
      const quizSubs = studentSubs.filter((s) => s.assessment.type === "quiz");

      const averageAssignmentScore =
        assignmentSubs.length === 0
          ? 0
          : Number(
              (
                assignmentSubs.reduce((s, v) => s + v.pct, 0) /
                assignmentSubs.length
              ).toFixed(2),
            );

      const academicAverage =
        studentSubs.length === 0
          ? 0
          : Number(
              (
                studentSubs.reduce((s, v) => s + v.pct, 0) / studentSubs.length
              ).toFixed(2),
            );

      const ogi = computeOgi(attendancePercentage, academicAverage);

      leaderboard.push({
        id: sid,
        name: student.user?.fullName,
        email: student.user?.email,
        ogi,
        attendance: attendancePercentage,
        assignmentScore: averageAssignmentScore,
      });
    }

    const sortKey =
      sortBy === "attendance" || sortBy === "assignmentScore" ? sortBy : "ogi";
    leaderboard.sort((a, b) => {
      const aVal = a[sortKey] || 0;
      const bVal = b[sortKey] || 0;
      return order === "asc" ? aVal - bVal : bVal - aVal;
    });

    res.status(200).json({
      message: "Leaderboard retrieved successfully",
      data: { leaderboard },
    });
  } catch (error) {
    console.error("Get Leaderboard Error:", error);
    res.status(500).json({
      message: "Failed to retrieve leaderboard",
    });
  }
};

export const getStudentWeeklySnapshots = async (req, res) => {
  try {
    const { id } = req.params;
    const { weeks = 8 } = req.query;

    const snapshots = await buildWeeklySnapshotsForStudent(id, Number(weeks));

    res.status(200).json({
      message: "Student weekly snapshots retrieved successfully",
      data: { snapshots },
    });
  } catch (error) {
    console.error("Get Student Weekly Snapshots Error:", error);
    res.status(500).json({
      message: "Failed to retrieve student weekly snapshots",
    });
  }
};
