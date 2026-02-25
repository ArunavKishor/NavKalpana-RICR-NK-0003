import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      minlength: [3, "Batch name must be at least 3 characters"],
      maxlength: [100, "Batch name must not exceed 100 characters"],
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    batchType: {
      type: String,
      enum: ["regular", "weekend", "fast-track", "self-paced"],
      default: "regular",
    },
    image: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: null,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return this.startDate && value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      index: true,
    },
    schedule: {
      type: String,
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: [true, "Max students is required"],
      min: [1, "Max students must be at least 1"],
      max: [500, "Max students must not exceed 500"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
      index: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        index: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    content: [
      {
        title: { type: String, required: true },
        body: { type: String, required: true },
        order: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

batchSchema.methods.computeStatus = function (now = new Date()) {
  if (!this.startDate || !this.endDate) {
    return this.status || "upcoming";
  }
  if (now < this.startDate) return "upcoming";
  if (now > this.endDate) return "completed";
  return "ongoing";
};

batchSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }
  this.status = this.computeStatus();
});

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
