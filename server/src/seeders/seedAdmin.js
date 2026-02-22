import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/userModel.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists:");
      console.log("Email:", existingAdmin.email);
      process.exit();
    }

    const admin = await User.create({
      fullName: "Super Admin",
      email: "admin@education.com",
      password: "Admin123", // will be hashed automatically
      role: "admin",
    });

    console.log("✅ Admin Created Successfully!");
    console.log("Email:", admin.email);
    console.log("Password: Admin123");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
