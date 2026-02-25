import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must not exceed 200 characters"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["assignment", "quiz"],
        message: "{VALUE} is not a valid assessment type",
      },
      index: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch is required"],
      index: true,
    },
    // Optional lesson-level metadata to attach assessments/quizzes
    moduleName: {
      type: String,
      trim: true,
      maxlength: [200, "Module name must not exceed 200 characters"],
    },
    lessonName: {
      type: String,
      trim: true,
      maxlength: [200, "Lesson name must not exceed 200 characters"],
    },
    lessonId: {
      type: String,
      trim: true,
      maxlength: [100, "Lesson ID must not exceed 100 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [1, "Total marks must be at least 1"],
      max: [1000, "Total marks must not exceed 1000"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    submissionType: {
      type: String,
      enum: ["PDF", "Image", "JPG", "Video", "Text", "Any"],
      default: "PDF",
    },
    // Quiz-specific fields
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 minute"],
      default: null,
    },
    maxAttempts: {
      type: Number,
      min: [1, "Max attempts must be at least 1"],
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

assessmentSchema.index({ type: 1, status: 1 });
assessmentSchema.index({ batch: 1, dueDate: 1 });

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
