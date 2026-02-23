import Attendance from "../models/attendanceModel.js";
import Student from "../models/studentModel.js";
import Batch from "../models/batchModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { formatValidationErrors } from "../utils/errors.js";

const validateEnrollment = async (studentId, batchId) => {
  const batch = await Batch.findById(batchId);
  if (!batch || !batch.isActive) {
    return { error: "Resource not found" };
  }
  const isEnrolled = batch.students.some(
    (id) => id.toString() === studentId.toString(),
  );
  if (!isEnrolled) {
    return { error: "Student is not enrolled in this batch" };
  }
  return { batch };
};

export const getAttendance = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { batch, student, status, startDate, endDate } = req.query;

    const filter = {};
    if (status && !["present", "absent", "late"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (batch) filter.batch = batch;
    if (student) filter.student = student;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate({
        path: "student",
        populate: { path: "user", select: "fullName email" },
      })
      .populate("batch", "name course")
      .populate("markedBy", "fullName email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Attendance records retrieved successfully",
      data: {
        records,
        pagination: paginationMeta,
      },
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ message: "Failed to retrieve attendance" });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const recordsInput = Array.isArray(req.body)
      ? req.body
      : req.body.records || [req.body];

    const created = [];

    for (const record of recordsInput) {
      const { student, batch, date, status, notes, remarks } = record;
      if (!student || !batch || !date || !status || !remarks) {
        return res.status(400).json({
          message: "student, batch, date, status, and remarks are required",
        });
      }

      // Validate remarks field (mandatory)
      if (!remarks || !remarks.trim()) {
        return res.status(400).json({
          message: "Remarks field is mandatory",
        });
      }

      const recordDate = new Date(date);
      recordDate.setHours(0, 0, 0, 0);

      const studentDoc = await Student.findById(student);
      if (!studentDoc || !studentDoc.isActive) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const { error } = await validateEnrollment(student, batch);
      if (error) {
        return res.status(400).json({ message: error });
      }

      const existing = await Attendance.findOne({
        student,
        batch,
        date: recordDate,
      });
      if (existing) {
        return res.status(409).json({
          message: "Attendance record already exists for this date",
        });
      }

      const createdRecord = await Attendance.create({
        student,
        batch,
        date: recordDate,
        status,
        notes,
        remarks,
        markedBy: req.user._id,
        submittedAt: new Date(),
      });
      created.push(createdRecord);
    }

    res.status(201).json({
      message: "Attendance marked successfully",
      data: { records: created },
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Create Attendance Error:", error);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate({
        path: "student",
        populate: { path: "user", select: "fullName email" },
      })
      .populate("batch", "name course")
      .populate("markedBy", "fullName email");

    if (!record) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Attendance record retrieved successfully",
      data: record,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ message: "Failed to retrieve attendance record" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Time-lock validation: only allow edit within 10 minutes of original submission
    const now = new Date();
    const submittedAt = record.submittedAt || record.createdAt;
    const diffInMinutes = (now - new Date(submittedAt)) / (1000 * 60);

    if (diffInMinutes > 10) {
      return res.status(403).json({
        message: "Attendance can only be edited within 10 minutes of submission.",
      });
    }

    // Same-day validation: only allow edit on the same day the attendance was marked for
    const recordDate = new Date(record.date);
    if (
      recordDate.getFullYear() !== now.getFullYear() ||
      recordDate.getMonth() !== now.getMonth() ||
      recordDate.getDate() !== now.getDate()
    ) {
      return res.status(403).json({
        message: "Attendance can only be edited on the same day it was recorded.",
      });
    }

    const fields = ["status", "notes", "remarks"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    if (req.body.date) {
      const normalizedDate = new Date(req.body.date);
      normalizedDate.setHours(0, 0, 0, 0);
      record.date = normalizedDate;
    }

    record.markedBy = req.user._id;
    await record.save();

    res.status(200).json({
      message: "Attendance record updated successfully",
      data: record,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Update Attendance Error:", error);
    res.status(500).json({ message: "Failed to update attendance" });
  }
};

export const getStudentAttendanceSummary = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const records = await Attendance.find({ student: student._id }).populate(
      "batch",
      "name course",
    );

    const summaryMap = new Map();
    records.forEach((record) => {
      const batchId = record.batch._id.toString();
      if (!summaryMap.has(batchId)) {
        summaryMap.set(batchId, {
          batch: record.batch,
          totalSessions: 0,
          presentCount: 0,
          lateCount: 0,
          percentage: 0,
        });
      }
      const summary = summaryMap.get(batchId);
      summary.totalSessions += 1;
      if (record.status === "present") summary.presentCount += 1;
      if (record.status === "late") summary.lateCount += 1;
    });

    const summaries = Array.from(summaryMap.values()).map((summary) => {
      const attended = summary.presentCount + summary.lateCount;
      const percentage =
        summary.totalSessions === 0
          ? 0
          : Number(((attended / summary.totalSessions) * 100).toFixed(2));
      return {
        ...summary,
        percentage,
      };
    });

    res.status(200).json({
      message: "Attendance summary retrieved successfully",
      data: { summaries },
    });
  } catch (error) {
    console.error("Get Student Attendance Summary Error:", error);
    res.status(500).json({ message: "Failed to retrieve attendance summary" });
  }
};

export const getBatchAttendanceStats = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const records = await Attendance.find({ batch: batch._id });
    const totalSessions = records.length;
    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const lateCount = records.filter((r) => r.status === "late").length;
    const percentage =
      totalSessions === 0
        ? 0
        : Number(
            (((presentCount + lateCount) / totalSessions) * 100).toFixed(2),
          );

    res.status(200).json({
      message: "Attendance statistics retrieved successfully",
      data: {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        percentage,
      },
    });
  } catch (error) {
    console.error("Get Batch Attendance Stats Error:", error);
    res.status(500).json({ message: "Failed to retrieve attendance stats" });
  }
};

export const exportAttendance = async (req, res) => {
  try {
    const { batch } = req.query;

    if (!batch) {
      return res.status(400).json({ message: "Batch ID is required for export" });
    }

    const records = await Attendance.find({ batch })
      .populate("student", "enrollmentId")
      .populate({
         path: "student",
         populate: { path: "user", select: "fullName email" }
      })
      .sort({ date: -1 });

    if (records.length === 0) {
      return res.status(404).json({ message: "No attendance records found to export" });
    }

    // CSV Header
    let csvData = "Date,Student Name,Enrollment ID,Status,Remarks\n";

    // CSV Rows
    records.forEach((record) => {
      const date = record.date.toISOString().split("T")[0];
      const studentName = record.student?.user?.fullName || "N/A";
      const enrollmentId = record.student?.enrollmentId || "N/A";
      const status = record.status;
      const remarks = `"${(record.remarks || "").replace(/"/g, '""')}"`;

      csvData += `${date},${studentName},${enrollmentId},${status},${remarks}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendance_export_${batch}.csv`);

    res.status(200).send(csvData);
  } catch (error) {
    console.error("Export Attendance Error:", error);
    res.status(500).json({ message: "Failed to export attendance" });
  }
};
