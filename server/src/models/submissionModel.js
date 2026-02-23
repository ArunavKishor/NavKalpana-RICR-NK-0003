import mongoose from "mongoose";

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
    submissionStatus: {
      type: String,
      enum: ["submitted", "late-submitted", "evaluated"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ student: 1, assessment: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
