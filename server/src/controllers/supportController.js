import SupportRequest from "../models/supportRequestModel.js";
import Student from "../models/studentModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import {
  formatValidationErrors,
  isDuplicateKeyError,
} from "../utils/errors.js";

export const createSupportRequest = async (req, res) => {
  try {
    const { student, subject, description, category, priority } = req.body;

    const studentDoc = await Student.findById(student);
    if (!studentDoc || !studentDoc.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const supportRequest = await SupportRequest.create({
      student,
      subject,
      description,
      category,
      priority: priority || "medium",
      status: "open",
      statusUpdatedAt: new Date(),
    });

    res.status(201).json({
      message: "Support request created successfully",
      data: supportRequest,
    });
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
    console.error("Create Support Request Error:", error);
    res.status(500).json({ message: "Failed to create support request" });
  }
};

export const getSupportRequests = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { search, status, priority, category, student } = req.query;

    const filter = {};
    if (status && !["open", "in-progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (priority && !["low", "medium", "high", "urgent"].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority filter" });
    }
    if (
      category &&
      !["technical", "academic", "administrative", "other"].includes(category)
    ) {
      return res.status(400).json({ message: "Invalid category filter" });
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (student) filter.student = student;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ subject: regex }, { description: regex }];
    }

    const total = await SupportRequest.countDocuments(filter);
    const requests = await SupportRequest.find(filter)
      .populate({
        path: "student",
        populate: { path: "user", select: "fullName email" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Support requests retrieved successfully",
      data: {
        requests,
        pagination: paginationMeta,
      },
    });
  } catch (error) {
    console.error("Get Support Requests Error:", error);
    res.status(500).json({ message: "Failed to retrieve support requests" });
  }
};

export const getSupportRequestById = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id).populate({
      path: "student",
      populate: { path: "user", select: "fullName email" },
    });

    if (!request) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json({
      message: "Support request retrieved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Get Support Request Error:", error);
    res.status(500).json({ message: "Failed to retrieve support request" });
  }
};

export const updateSupportRequest = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const fields = ["subject", "description", "category", "priority", "status"];
    let statusChanged = false;

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "status" && req.body.status !== request.status) {
          statusChanged = true;
        }
        request[field] = req.body[field];
      }
    });

    if (statusChanged) {
      request.statusUpdatedAt = new Date();
      if (request.status === "resolved") {
        request.resolvedAt = new Date();
      }
      if (request.status === "closed") {
        request.closedAt = new Date();
      }
    }

    await request.save();

    res.status(200).json({
      message: "Support request updated successfully",
      data: request,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Update Support Request Error:", error);
    res.status(500).json({ message: "Failed to update support request" });
  }
};

export const respondToSupportRequest = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Response message is required" });
    }

    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Resource not found" });
    }

    request.responses.push({
      admin: req.user._id,
      message,
      createdAt: new Date(),
    });

    if (request.status === "open") {
      request.status = "in-progress";
      request.statusUpdatedAt = new Date();
    }

    await request.save();

    res.status(200).json({
      message: "Response added successfully",
      data: request,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Respond Support Request Error:", error);
    res.status(500).json({ message: "Failed to respond to support request" });
  }
};

export const resolveSupportRequest = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Resource not found" });
    }

    request.status = "resolved";
    request.statusUpdatedAt = new Date();
    request.resolvedAt = new Date();
    await request.save();

    res.status(200).json({
      message: "Support request resolved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Resolve Support Request Error:", error);
    res.status(500).json({ message: "Failed to resolve support request" });
  }
};

export const getSupportStatistics = async (req, res) => {
  try {
    const requests = await SupportRequest.find();
    const statusCounts = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    const resolvedRequests = requests.filter((r) => r.resolvedAt);
    const totalResolutionTime = resolvedRequests.reduce((sum, request) => {
      return sum + (request.resolvedAt - request.createdAt);
    }, 0);
    const avgResolutionTimeMs =
      resolvedRequests.length === 0
        ? 0
        : totalResolutionTime / resolvedRequests.length;

    const responseTimes = requests
      .filter((r) => r.responses?.length)
      .map((r) => new Date(r.responses[0].createdAt) - r.createdAt);
    const avgResponseTimeMs =
      responseTimes.length === 0
        ? 0
        : responseTimes.reduce((sum, value) => sum + value, 0) /
          responseTimes.length;

    const resolutionRate =
      requests.length === 0
        ? 0
        : (resolvedRequests.length / requests.length) * 100;

    res.status(200).json({
      message: "Support statistics retrieved successfully",
      data: {
        statusCounts,
        averageResolutionTimeMs: avgResolutionTimeMs,
        averageResponseTimeMs: avgResponseTimeMs,
        openRequestCount: statusCounts.open || 0,
        resolutionRate,
      },
    });
  } catch (error) {
    console.error("Get Support Statistics Error:", error);
    res.status(500).json({ message: "Failed to retrieve support statistics" });
  }
};
