import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin reference is required"],
    },
    message: {
      type: String,
      required: [true, "Response message is required"],
      trim: true,
      minlength: [2, "Response message must be at least 2 characters"],
      maxlength: [2000, "Response message must not exceed 2000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const supportRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      minlength: [5, "Subject must be at least 5 characters"],
      maxlength: [200, "Subject must not exceed 200 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["technical", "academic", "administrative", "other"],
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    responses: [responseSchema],
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

supportRequestSchema.index({ status: 1, priority: 1 });

const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);

export default SupportRequest;
