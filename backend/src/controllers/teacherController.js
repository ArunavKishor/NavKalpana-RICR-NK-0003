import Teacher from "../models/teacherModel.js";
import User from "../models/userModel.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import {
  formatValidationErrors,
  isDuplicateKeyError,
} from "../utils/errors.js";

const buildTeacherSearchFilter = async (search) => {
  if (!search) return {};

  const regex = new RegExp(search, "i");
  const users = await User.find({
    $or: [{ fullName: regex }, { email: regex }],
  }).select("_id");
  const userIds = users.map((u) => u._id);

  return {
    $or: [{ employeeId: regex }, { user: { $in: userIds } }],
  };
};

export const createTeacher = async (req, res) => {
  let user = null;
  try {
    const { userId, fullName, email, password, phone, joiningDate, status } = req.body;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      if (!fullName || !email || !password) {
        return res.status(400).json({
          message: "fullName, email, and password are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      user = await User.create({
        fullName,
        email,
        password,
        role: "teacher",
      });
    }

    try {
      const teacher = await Teacher.create({
        user: user._id,
        phone,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        status,
      });

      res.status(201).json({
        message: "Teacher created successfully",
        data: teacher,
      });
    } catch (teacherError) {
      if (!userId && user) {
        await User.findByIdAndDelete(user._id);
      }
      throw teacherError;
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
      return res.status(409).json({ message: "Teacher resource already exists" });
    }
    console.error("Create Teacher Error:", error);
    res.status(500).json({ message: "Failed to create teacher" });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ message: pagination.error });
    }

    const { page, limit, skip } = pagination;
    const { search, status, startDate, endDate } = req.query;

    const filter = { isActive: true };
    if (status && !["active", "inactive", "resigned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.joiningDate = {};
      if (startDate) filter.joiningDate.$gte = new Date(startDate);
      if (endDate) filter.joiningDate.$lte = new Date(endDate);
    }

    const searchFilter = await buildTeacherSearchFilter(search);
    const finalFilter = { ...filter, ...searchFilter };

    const total = await Teacher.countDocuments(finalFilter);
    const teachers = await Teacher.find(finalFilter)
      .populate("user", "fullName email isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const paginationMeta = buildPaginationMeta(page, limit, total);

    res.status(200).json({
      message: "Teachers retrieved successfully",
      data: {
        teachers,
        pagination: paginationMeta,
      },
    });
  } catch (error) {
    console.error("Get Teachers Error:", error);
    res.status(500).json({ message: "Failed to retrieve teachers" });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("user", "fullName email");

    if (!teacher || !teacher.isActive) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({
      message: "Teacher retrieved successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Get Teacher Error:", error);
    res.status(500).json({ message: "Failed to retrieve teacher" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { fullName, email, phone, status } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher || !teacher.isActive) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (phone !== undefined) teacher.phone = phone;
    if (status !== undefined) teacher.status = status;

    if (fullName || email) {
      const user = await User.findById(teacher.user);
      if (!user) {
        return res.status(404).json({ message: "Associated user not found" });
      }
      if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(409).json({ message: "User email already exists" });
        }
        user.email = email;
      }
      if (fullName) user.fullName = fullName;
      await user.save();
    }

    await teacher.save();

    const updatedTeacher = await Teacher.findById(req.params.id).populate("user", "fullName email");

    res.status(200).json({
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    const validationErrors = formatValidationErrors(error);
    if (validationErrors) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }
    console.error("Update Teacher Error:", error);
    res.status(500).json({ message: "Failed to update teacher" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher || !teacher.isActive) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.isActive = false;
    await teacher.save();

    const user = await User.findById(teacher.user);
    if (user) {
      user.isActive = false;
      await user.save();
    }

    res.status(200).json({
      message: "Teacher deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete Teacher Error:", error);
    res.status(500).json({ message: "Failed to delete teacher" });
  }
};
