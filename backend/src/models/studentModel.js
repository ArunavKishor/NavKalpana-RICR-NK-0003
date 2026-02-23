import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    enrollmentId: {
      type: String,
      required: [true, "Enrollment ID is required"],
      unique: true,
      match: [/^ENR-\d{4}-\d{3}$/, "Invalid enrollment ID format"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s().-]{7,20}$/, "Please provide a valid phone number"],
    },
    enrollmentDate: {
      type: Date,
      required: [true, "Enrollment date is required"],
      validate: {
        validator: (value) => value <= new Date(),
        message: "Enrollment date cannot be in the future",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
      index: true,
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        index: true,
      },
    ],
    enrollmentHistory: [
      {
        batch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Batch",
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        unenrolledAt: {
          type: Date,
        },
      },
    ],
    github: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

studentSchema.statics.generateEnrollmentId = async function () {
  const year = new Date().getFullYear();
  const prefix = `ENR-${year}-`;
  const lastStudent = await this.findOne({
    enrollmentId: { $regex: `^${prefix}` },
  })
    .sort({ enrollmentId: -1 })
    .select("enrollmentId");

  let sequence = 1;
  if (lastStudent?.enrollmentId) {
    const parts = lastStudent.enrollmentId.split("-");
    const lastSeq = Number(parts[2]);
    if (!Number.isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const padded = String(sequence).padStart(3, "0");
  return `${prefix}${padded}`;
};

studentSchema.pre("validate", async function () {
  if (!this.enrollmentId) {
    const Student = this.constructor;
    this.enrollmentId = await Student.generateEnrollmentId();
  }
  if (!this.enrollmentDate) {
    this.enrollmentDate = new Date();
  }
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
