import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Option label is required"],
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const quizQuestionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: [true, "Assessment is required for a quiz question"],
      index: true,
    },
    prompt: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: [3, "Question must be at least 3 characters"],
    },
    options: {
      type: [optionSchema],
      validate: {
        validator(value) {
          if (!Array.isArray(value) || value.length < 2) return false;
          return value.some((opt) => opt.isCorrect);
        },
        message:
          "Quiz question must have at least two options and at least one correct option",
      },
    },
    marks: {
      type: Number,
      default: 1,
      min: [0, "Marks cannot be negative"],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

quizQuestionSchema.index({ assessment: 1, order: 1 });

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);

export default QuizQuestion;
