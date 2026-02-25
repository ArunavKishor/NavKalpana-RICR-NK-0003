import Batch from "../models/batchModel.js";
import Student from "../models/studentModel.js";
import Attendance from "../models/attendanceModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import {
  formatValidationErrors,
  isDuplicateKeyError,
} from "../utils/errors.js";

/* ---------------------------------- */
/* Helper: Auto status updater        */
/* ---------------------------------- */
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

/* ---------------------------------- */
/* CREATE BATCH                       */
/* ---------------------------------- */
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

    /* ✅ Manual validation */
    if (!name || !course || !startDate || !endDate || !maxStudents) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (isNaN(parsedStart) || isNaN(parsedEnd)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const batch = await Batch.create({
      name: name.trim(),
      course: course.trim(),
      startDate: parsedStart,
      endDate: parsedEnd,
      instructor,
      schedule,
      maxStudents: Number(maxStudents),
      image: req.file?.path || "",
      createdBy: req.user._id,
      students: [],
    });

    res.status(201).json({
      success: true,
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
      return res.status(409).json({ message: "Batch already exists" });
    }

    console.error("Create Batch Error:", error);
    res.status(500).json({ message: "Failed to create batch" });
  }
};

/* ---------------------------------- */
/* GET ALL BATCHES                    */
/* ---------------------------------- */
export const getBatches = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { search, status, course } = req.query;

    const filter = { isActive: true };

    if (status) filter.status = status;
    if (course) filter.course = course;

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

    res.status(200).json({
      success: true,
      message: "Batches retrieved successfully",
      data: {
        batches: batches.map((batch) => ({
          ...batch.toObject(),
          enrolledStudents: batch.students.length,
        })),
        pagination: buildPaginationMeta(page, limit, total),
      },
    });
  } catch (error) {
    console.error("Get Batches Error:", error);
    res.status(500).json({ message: "Failed to retrieve batches" });
  }
};

/* ---------------------------------- */
/* GET BATCH BY ID                    */
/* ---------------------------------- */
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      "createdBy",
      "fullName email"
    );

    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const computed = batch.computeStatus(new Date());
    if (batch.status !== computed) {
      batch.status = computed;
      await batch.save();
    }

    res.status(200).json({
      success: true,
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

/* ---------------------------------- */
/* UPDATE BATCH                       */
/* ---------------------------------- */
export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Batch not found" });
    }

    Object.keys(req.body).forEach((key) => {
      batch[key] = req.body[key];
    });

    if (req.file) {
      batch.image = req.file.path;
    }

    batch.status = batch.computeStatus(new Date());

    await batch.save();

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Update Batch Error:", error);
    res.status(500).json({ message: "Failed to update batch" });
  }
};

/* ---------------------------------- */
/* DELETE (SOFT)                      */
/* ---------------------------------- */
export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Batch not found" });
    }

    batch.isActive = false;
    await batch.save();

    res.status(200).json({ success: true, message: "Batch deleted" });
  } catch (error) {
    console.error("Delete Batch Error:", error);
    res.status(500).json({ message: "Failed to delete batch" });
  }
};

/* ---------------------------------- */
/* STUDENTS                           */
/* ---------------------------------- */
export const getBatchStudents = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch || !batch.isActive) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const students = await Student.find({ _id: { $in: batch.students } })
      .populate("user", "fullName email");

    res.status(200).json({
      success: true,
      message: "Batch students retrieved successfully",
      data: { students },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve students" });
  }
};

/* ---------------------------------- */
/* ATTENDANCE                         */
/* ---------------------------------- */
export const getBatchAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ batch: req.params.id });

    res.status(200).json({
      success: true,
      message: "Batch attendance retrieved successfully",
      data: { attendance: records },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve attendance" });
  }
};

/* ---------------------------------- */
/* COVER IMAGE                        */
/* ---------------------------------- */
export const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    batch.coverImage = req.file.path;
    await batch.save();

    res.status(200).json({
      success: true,
      fileUrl: req.file.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};