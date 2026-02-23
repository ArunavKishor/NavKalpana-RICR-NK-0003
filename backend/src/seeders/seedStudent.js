import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/userModel.js";

dotenv.config();

const seedStudents = async () => {
  try {
    // ✅ Connect Database
    await connectDB();

    console.log("📦 Connected to DB");

    // ✅ Check if students already exist
    const existingStudent = await User.findOne({ role: "student" });

    if (existingStudent) {
      console.log("⚠️ Students already exist in database");
      console.log(
        `Student: ${existingStudent.fullName} | ${existingStudent.email}`
      );
      process.exit(0);
    }

    // ✅ Student Data
    const students = [
      {
        fullName: "Rahul Sharma",
        email: "rahul@student.com",
        password: "Student123", // hashed by schema middleware
        role: "student",
      },
      {
        fullName: "Priya Verma",
        email: "priya@student.com",
        password: "Student123",
        role: "student",
      },
    ];

    // ✅ Insert students
    const createdStudents = await User.insertMany(students);

    console.log("\n✅ Students Created Successfully!\n");

    createdStudents.forEach((student) => {
      console.log("Name:", student.fullName);
      console.log("Email:", student.email);
      console.log("Password: Student123");
      console.log("---------------------------");
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding students:", error.message);
    process.exit(1);
  }
};

seedStudents();