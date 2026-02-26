import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import cloudinary from "./src/config/cloudinary.js";
import connectDB from "./src/config/db.js";
import { createRateLimiter } from "./src/middleware/rateLimit.js";

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

// ✅ Middleware
const devOrigins = ["http://localhost:5173"];

const allowedOrigins = [
  ...devOrigins,
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, "")) // strip trailing slashes
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Use callback(null, false) — NOT new Error() — so Express's global error
      // handler doesn't fire and strip the CORS headers from the response
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Rate Limiting (data-fetching APIs only)
const dataFetchLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 120,
  message: "Too many requests. Please slow down.",
});

// ✅ Routes
app.use("/api", (req, res, next) => {
  if (req.method === "GET") {
    return dataFetchLimiter(req, res, next);
  }
  return next();
});
app.use("/api/auth", AuthRouter);
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
