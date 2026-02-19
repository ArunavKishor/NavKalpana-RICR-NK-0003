import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import ContactRouter from "./src/routers/contactRoutes.js";
import AuthRouter from "./src/routers/authRouter.js";
import StudentRouter from "./src/routers/studentRoutes.js";
import BatchRouter from "./src/routers/batchRoutes.js";
import AttendanceRouter from "./src/routers/attendanceRoutes.js";
import AssessmentRouter from "./src/routers/assessmentRoutes.js";
import SupportRouter from "./src/routers/supportRoutes.js";
import DashboardRouter from "./src/routers/dashboardRoutes.js";

dotenv.config();

const app = express();

// Connect DB First
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/contact", ContactRouter);
app.use("/api/students", StudentRouter);
app.use("/api/batches", BatchRouter);
app.use("/api/attendance", AttendanceRouter);
app.use("/api/assessments", AssessmentRouter);
app.use("/api/support", SupportRouter);
app.use("/api/dashboard", DashboardRouter);

// Default Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working ✅" });
});

// Global Error Handler
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

app.listen(port, () => {
  console.log(`🚀 Server Started at Port: ${port}`);
});
