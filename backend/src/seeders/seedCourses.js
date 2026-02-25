import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Batch from "../models/batchModel.js";
import User from "../models/userModel.js";
import Teacher from "../models/teacherModel.js";

dotenv.config();

const sampleBatches = [
  {
    name: "Full Stack Web Development - Batch A",
    course: "Full Stack Web Development",
    batchType: "regular",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-06-15"),
    maxStudents: 30,
    schedule: "Mon-Fri 10:00 AM - 1:00 PM",
  },
  {
    name: "Data Structures & Algorithms",
    course: "DSA",
    batchType: "regular",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-05-01"),
    maxStudents: 25,
    schedule: "Tue-Thu 2:00 PM - 5:00 PM",
  },
  {
    name: "React & Node.js - Weekend Batch",
    course: "MERN Stack",
    batchType: "weekend",
    startDate: new Date("2026-01-20"),
    endDate: new Date("2026-07-20"),
    maxStudents: 20,
    schedule: "Sat-Sun 10:00 AM - 2:00 PM",
  },
  {
    name: "Python for Data Science",
    course: "Data Science",
    batchType: "regular",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-08-01"),
    maxStudents: 35,
    schedule: "Mon-Wed-Fri 3:00 PM - 6:00 PM",
  },
  {
    name: "DevOps Fast Track",
    course: "DevOps Engineering",
    batchType: "fast-track",
    startDate: new Date("2026-02-15"),
    endDate: new Date("2026-04-15"),
    maxStudents: 15,
    schedule: "Mon-Fri 9:00 AM - 4:00 PM",
  },
];

const seedCourses = async () => {
  try {
    await connectDB();

    // Find an admin user to set as createdBy
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found. Please run seedAdmin first.");
      process.exit(1);
    }

    // Optionally find a teacher to assign
    const teacher = await Teacher.findOne({ isActive: true });

    const existingCount = await Batch.countDocuments();
    if (existingCount > 0) {
      console.log(
        `${existingCount} batch(es) already exist. Skipping seed to avoid duplicates.`,
      );
      console.log("To re-seed, first remove existing batches from the DB.");
      process.exit();
    }

    const batchDocs = sampleBatches.map((b) => ({
      ...b,
      createdBy: admin._id,
      instructor: teacher?._id || null,
      students: [],
    }));

    const created = await Batch.insertMany(batchDocs);

    console.log(`${created.length} sample batches/courses created:`);
    created.forEach((b) => {
      console.log(`  - ${b.name} (${b.course}) [${b.batchType}]`);
    });

    process.exit();
  } catch (error) {
    console.error("Seed Courses Error:", error);
    process.exit(1);
  }
};

seedCourses();
