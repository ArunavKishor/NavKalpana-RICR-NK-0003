import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
      index: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: [true, "Assessment is required"],
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    // File submission fields (for assignments)
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      enum: ["PDF", "Image", "JPG", "Video", "Text"],
      default: "PDF",
    },
    isLateSubmission: {
      type: Boolean,
      default: false,
    },
    // Quiz answer submission fields
    answers: [answerSchema],
    // Grading fields
    status: {
      type: String,
      enum: ["submitted", "late-submitted", "evaluated"],
      default: "submitted",
      index: true,
    },
    marksObtained: {
      type: Number,
      min: [0, "Marks obtained cannot be negative"],
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ student: 1, assessment: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
