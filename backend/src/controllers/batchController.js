import Batch from "../models/batchModel.js";
import Student from "../models/studentModel.js";
import Attendance from "../models/attendanceModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import {
  formatValidationErrors,
  isDuplicateKeyError,
} from "../utils/errors.js";

const applyBatchStatusUpdates = async (batches) => {
  const now = new Date();
  const updates = batches.map(async (batch) => {
    const computed = batch.computeStatus(now);
    if (batch.status !== computed) {
      batch.status = computed;
      await batch.save();
    }
    return batch;
  });
  return Promise.all(updates);
};

export const createBatch = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const {
      name,
      course,
      startDate,
      endDate,
      instructor,
      schedule,
      maxStudents,
    } = req.body;

    const batch = await Batch.create({
      name,
      course,
      startDate,
      endDate,
      instructor,
      schedule,
      maxStudents: maxStudents ? Number(maxStudents) : 0,
      image: req.file ? req.file.path : "",
      createdBy: req.user._id,
      students: [],
    });

    res.status(201).json({
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid data format" });
    }
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
    console.error("Create Batch Error:", error);
    res.status(500).json({
      message: "Failed to create batch",
      error: error.message
    });
  }
};

export const getBatches = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { search, status, course, startDate, endDate } = req.query;

    const filter = { isActive: true };
    if (status && !["upcoming", "ongoing", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (status) filter.status = status;
    if (course) filter.course = course;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { course: regex }, { instructor: regex }];
    }

    const total = await Batch.countDocuments(filter);
    let batches = await Batch.find(filter)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    batches = await applyBatchStatusUpdates(batches);

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Batches retrieved successfully",
      data: {
        batches: batches.map((batch) => ({
          ...batch.toObject(),
          enrolledStudents: batch.students.length,
        })),
        pagination: paginationMeta,
      },
    });
  } catch (error) {
    console.error("Get Batches Error:", error);
    res.status(500).json({ message: "Failed to retrieve batches" });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      "createdBy",
      "fullName email",
    );
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const computed = batch.computeStatus(new Date());
    if (batch.status !== computed) {
      batch.status = computed;
      await batch.save();
    }

    res.status(200).json({
      message: "Batch retrieved successfully",
      data: {
        ...batch.toObject(),
        enrolledStudents: batch.students.length,
      },
    });
  } catch (error) {
    console.error("Get Batch Error:", error);
    res.status(500).json({ message: "Failed to retrieve batch" });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }
    const fields = [
      "name",
      "course",
      "startDate",
      "endDate",
      "instructor",
      "schedule",
      "maxStudents",
      "content",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        batch[field] = req.body[field];
      }
    });

    if (req.file) {
      batch.image = req.file.path;
    }

    batch.status = batch.computeStatus(new Date());
    await batch.save();

    res.status(200).json({
      message: "Batch updated successfully",
      data: batch,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid data format" });
    }
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Update Batch Error:", error);
    res.status(500).json({ message: "Failed to update batch" });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    batch.isActive = false;
    await batch.save();

    res.status(200).json({
      message: "Batch deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete Batch Error:", error);
    res.status(500).json({ message: "Failed to delete batch" });
  }
};

export const getBatchStudents = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const students = await Student.find({ _id: { $in: batch.students } })
      .populate("user", "fullName email")
      .select("user enrollmentId status phone");

    res.status(200).json({
      message: "Batch students retrieved successfully",
      data: { students },
    });
  } catch (error) {
    console.error("Get Batch Students Error:", error);
    res.status(500).json({ message: "Failed to retrieve batch students" });
  }
};

export const getBatchAttendance = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const records = await Attendance.find({ batch: batch._id })
      .populate({
        path: "student",
        populate: { path: "user", select: "fullName email" },
      })
      .populate("markedBy", "fullName email")
      .sort({ date: 1 });

    const grouped = records.reduce((acc, record) => {
      const key = record.date.toISOString().split("T")[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    }, {});

    const groupedList = Object.entries(grouped)
      .map(([date, list]) => ({
        date,
        records: list,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      message: "Batch attendance retrieved successfully",
      data: { attendance: groupedList },
    });
  } catch (error) {
    console.error("Get Batch Attendance Error:", error);
    res.status(500).json({ message: "Failed to retrieve attendance" });
  }
};

export const uploadCoverImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const batch = await Batch.findById(id);
    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Batch not found" });
    }

    batch.coverImage = req.file.path;
    await batch.save();

    res.status(200).json({
      message: "Batch cover image uploaded successfully",
      data: {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        coverImage: batch.coverImage,
      },
    });
  } catch (error) {
    console.error("Upload Cover Image Error:", error);
    res.status(500).json({ message: "Failed to upload cover image" });
  }
};
