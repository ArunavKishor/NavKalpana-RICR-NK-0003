import mongoose from "mongoose";

const weeklySnapshotSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    // ISO week anchor (we store Monday's date at 00:00:00)
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },

    // Core aggregates (percentages are 0–100)
    attendancePercentage: {
      type: Number,
      default: 0,
    },
    quizAverage: {
      type: Number,
      default: 0,
    },
    assignmentAverage: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    submissionConsistency: {
      type: Number,
      default: 0,
    },
    ogi: {
      type: Number,
      default: 0,
    },

    // Optional enrichment used by dashboards
    totalSessions: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    weeklyLearningHours: {
      type: Number,
      default: 0,
    },
    skillAcquisitionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

weeklySnapshotSchema.index({ student: 1, weekStart: 1 }, { unique: true });

const WeeklySnapshot = mongoose.model("WeeklySnapshot", weeklySnapshotSchema);

export default WeeklySnapshot;

