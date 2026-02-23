import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      match: [/^EMP-\d{4}-\d{3}$/, "Invalid employee ID format"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[+]?[\d\s().-]{7,20}$/,
        "Please provide a valid phone number",
      ],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
      validate: {
        validator: (value) => value <= new Date(),
        message: "Joining date cannot be in the future",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "resigned"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
      index: true,
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

teacherSchema.statics.generateEmployeeId = async function () {
  const year = new Date().getFullYear();
  const prefix = `EMP-${year}-`;
  const lastTeacher = await this.findOne({
    employeeId: { $regex: `^${prefix}` },
  })
    .sort({ employeeId: -1 })
    .select("employeeId");

  let sequence = 1;
  if (lastTeacher?.employeeId) {
    const parts = lastTeacher.employeeId.split("-");
    const lastSeq = Number(parts[2]);
    if (!Number.isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const padded = String(sequence).padStart(3, "0");
  return `${prefix}${padded}`;
};

teacherSchema.pre("validate", async function () {
  if (!this.employeeId) {
    const Teacher = this.constructor;
    this.employeeId = await Teacher.generateEmployeeId();
  }
  if (!this.joiningDate) {
    this.joiningDate = new Date();
  }
});

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
