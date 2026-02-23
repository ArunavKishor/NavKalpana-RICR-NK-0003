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
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ student: 1, assessment: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
