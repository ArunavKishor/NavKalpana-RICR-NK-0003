import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import cloudinary from "./src/config/cloudinary.js";
import connectDB from "./src/config/db.js";

import ContactRouter from "./src/routers/contactRoutes.js";
import AuthRouter from "./src/routers/authRouter.js";
import StudentRouter from "./src/routers/studentRoutes.js";
import BatchRouter from "./src/routers/batchRoutes.js";
import AttendanceRouter from "./src/routers/attendanceRoutes.js";
import AssessmentRouter from "./src/routers/assessmentRoutes.js";
import SupportRouter from "./src/routers/supportRoutes.js";
import DashboardRouter from "./src/routers/dashboardRoutes.js";
import TeacherRouter from "./src/routers/teacherRoutes.js";

dotenv.config();

const app = express();

// ✅ Security Middleware (add BEFORE other middleware)
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later.",
  })
);

// ✅ Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Routes
app.use("/api/auth", AuthRouter);
app.use("/api/contact", ContactRouter);
app.use("/api/students", StudentRouter);
app.use("/api/batches", BatchRouter);
app.use("/api/attendance", AttendanceRouter);
app.use("/api/assessments", AssessmentRouter);
app.use("/api/support", SupportRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/teachers", TeacherRouter);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working ✅" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  const errorMessage = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  console.error("Error Found:", errorMessage);

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
});

const port = process.env.PORT || 4500;

// ✅ START SERVER PROPERLY (ONLY ONE LISTEN)
const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Check Cloudinary
    const res = await cloudinary.api.ping();
    console.log("☁️ Cloudinary Connected:", res.status);

    // Start Express Server
    app.listen(port, () => {
      console.log(`🚀 Server Started at Port: ${port}`);
    });
  } catch (error) {
    console.error("❌ Server Startup Failed:", error);
    process.exit(1);
  }
};

startServer();
