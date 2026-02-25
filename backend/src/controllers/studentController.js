import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import Batch from "../models/batchModel.js";
import Attendance from "../models/attendanceModel.js";
import Submission from "../models/submissionModel.js";
import Teacher from "../models/teacherModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import {
  formatValidationErrors,
  isDuplicateKeyError,
} from "../utils/errors.js";

const buildStudentSearchFilter = async (search) => {
  if (!search) return {};

  const regex = new RegExp(search, "i");
  const users = await User.find({
    $or: [{ fullName: regex }, { email: regex }],
  }).select("_id");
  const userIds = users.map((u) => u._id);

  return {
    $or: [{ enrollmentId: regex }, { user: { $in: userIds } }],
  };
};

export const createStudent = async (req, res) => {
  let user = null;
  try {
    const { userId, fullName, email, password, phone, enrollmentDate, status } =
      req.body;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Resource not found" });
      }
    } else {
      if (!fullName || !email || !password) {
        return res.status(400).json({
          message:
            "fullName, email, and password are required when userId is not provided",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Resource already exists" });
      }

      user = await User.create({
        fullName,
        email,
        password,
        role: "student",
      });
    }

    try {
      const student = await Student.create({
        user: user._id,
        phone,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : undefined,
        status,
        batches: [],
        enrollmentHistory: [],
      });

      res.status(201).json({
        message: "Student created successfully",
        data: student,
      });
    } catch (studentError) {
      // Manual rollback: if creating student fails, and we created a new user, delete the user
      if (!userId && user) {
        await User.findByIdAndDelete(user._id);
      }
      throw studentError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "Resource already exists" });
    }
    console.error("Create Student Error Detailed:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      message: "Failed to create student. Please check server logs.",
      error: error.message,
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { search, status, batch, startDate, endDate } = req.query;

    const filter = { isActive: true };
    if (status && !["active", "inactive", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (status) filter.status = status;
    
    // Teacher scoping
    if (req.user && req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ user: req.user._id, isActive: true });
      if (!teacher) {
        return res.status(200).json({
          message: "No students found",
          data: { students: [], pagination: buildPaginationMeta(page, limit, 0) }
        });
      }
      const teacherBatches = await Batch.find({ instructor: teacher._id, isActive: true }).select("_id");
      const teacherBatchIds = teacherBatches.map((b) => b._id);

      if (batch) {
        if (!teacherBatchIds.some(id => id.toString() === batch.toString())) {
          return res.status(200).json({
            message: "No students found",
            data: { students: [], pagination: buildPaginationMeta(page, limit, 0) }
          });
        }
        filter.batches = batch;
      } else {
        filter.batches = { $in: teacherBatchIds };
      }
    } else {
      if (batch) filter.batches = batch;
    }

    if (startDate || endDate) {
      filter.enrollmentDate = {};
      if (startDate) filter.enrollmentDate.$gte = new Date(startDate);
      if (endDate) filter.enrollmentDate.$lte = new Date(endDate);
    }

    const searchFilter = await buildStudentSearchFilter(search);
    const finalFilter = { ...filter, ...searchFilter };

    const total = await Student.countDocuments(finalFilter);
    const students = await Student.find(finalFilter)
      .populate("user", "fullName email")
      .populate("batches", "name course")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Students retrieved successfully",
      data: {
        students,
        pagination: paginationMeta,
      },
    });
  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ message: "Failed to retrieve students" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "fullName email")
      .populate("batches", "name course");

    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Student retrieved successfully",
      data: student,
    });
  } catch (error) {
    console.error("Get Student Error:", error);
    res.status(500).json({ message: "Failed to retrieve student" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { fullName, email, phone, status } = req.body;

    const student = await Student.findById(req.params.id).populate(
      "user",
      "fullName email",
    );
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (phone !== undefined) student.phone = phone;
    if (status !== undefined) student.status = status;

    if (fullName || email) {
      const user = await User.findById(student.user);
      if (!user) {
        return res.status(404).json({ message: "Resource not found" });
      }
      if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(409).json({ message: "Resource already exists" });
        }
        user.email = email;
      }
      if (fullName) user.fullName = fullName;
      await user.save();
    }

    await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Update Student Error:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    student.isActive = false;
    await student.save();

    res.status(200).json({
      message: "Student deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete Student Error:", error);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

export const getStudentBatches = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "batches",
      "name course startDate endDate status",
    );
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Student batches retrieved successfully",
      data: {
        batches: student.batches,
      },
    });
  } catch (error) {
    console.error("Get Student Batches Error:", error);
    res.status(500).json({ message: "Failed to retrieve batches" });
  }
};

export const enrollStudentInBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (batch.students.length >= batch.maxStudents) {
      return res
        .status(400)
        .json({ message: "Batch has reached maximum capacity" });
    }

    const isEnrolled = batch.students.some(
      (id) => id.toString() === student._id.toString(),
    );
    if (!isEnrolled) {
      batch.students.push(student._id);
      await batch.save();
    }

    const studentHasBatch = student.batches.some(
      (id) => id.toString() === batch._id.toString(),
    );
    if (!studentHasBatch) {
      student.batches.push(batch._id);
    }

    student.enrollmentHistory.push({
      batch: batch._id,
      enrolledAt: new Date(),
    });
    await student.save();

    res.status(200).json({
      message: "Student enrolled successfully",
      data: { student, batch },
    });
  } catch (error) {
    console.error("Enroll Student Error:", error);
    res.status(500).json({ message: "Failed to enroll student" });
  }
};

export const unenrollStudentFromBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const batch = await Batch.findById(batchId);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    batch.students = batch.students.filter(
      (id) => id.toString() !== student._id.toString(),
    );
    await batch.save();

    student.batches = student.batches.filter(
      (id) => id.toString() !== batch._id.toString(),
    );

    const latestHistory = [...student.enrollmentHistory]
      .reverse()
      .find(
        (entry) =>
          entry.batch.toString() === batch._id.toString() &&
          !entry.unenrolledAt,
      );
    if (latestHistory) {
      latestHistory.unenrolledAt = new Date();
    } else {
      student.enrollmentHistory.push({
        batch: batch._id,
        enrolledAt: new Date(),
        unenrolledAt: new Date(),
      });
    }

    await student.save();

    res.status(200).json({
      message: "Student unenrolled successfully",
      data: { student, batch },
    });
  } catch (error) {
    console.error("Unenroll Student Error:", error);
    res.status(500).json({ message: "Failed to unenroll student" });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    res.json({ message: "Attendance fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 1. Attendance Metrics
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === "present").length;
    const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
    const lateCount = attendanceRecords.filter(r => r.status === "late").length;

    const attendancePercentage = totalSessions === 0
      ? 0
      : Number((( (presentCount + (lateCount * 0.5)) / totalSessions) * 100).toFixed(2));

    // 2. Assessment Metrics
    const submissions = await Submission.find({ student: studentId }).populate("assessment");
    const totalSubmissions = submissions.length;
    const evaluatedSubmissions = submissions.filter(s => s.status === "evaluated");

    let totalScore = 0;
    let maxPossibleScore = 0;
    evaluatedSubmissions.forEach(s => {
      totalScore += s.marksObtained || 0;
      maxPossibleScore += s.assessment?.totalMarks || 0;
    });

    const averageGrade = maxPossibleScore === 0 ? 0 : Number(((totalScore / maxPossibleScore) * 100).toFixed(2));

    // 3. OGI (Overall Growth Index) Calculation
    // Logic: 40% Attendance, 60% Academic Performance
    const ogi = Number(((attendancePercentage * 0.4) + (averageGrade * 0.6)).toFixed(2));

    res.status(200).json({
      message: "Student progress retrieved successfully",
      data: {
        attendance: {
          percentage: attendancePercentage,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          total: totalSessions
        },
        academics: {
          averageGrade,
          totalSubmissions,
          evaluated: evaluatedSubmissions.length,
          totalScore,
          maxPossibleScore
        },
        ogi,
        status: student.status
      }
    });
  } catch (error) {
    console.error("Get Student Progress Error:", error);
    res.status(500).json({ message: "Failed to retrieve student progress" });
  }
};
