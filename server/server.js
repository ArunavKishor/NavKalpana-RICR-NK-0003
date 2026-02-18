import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import ContactRouter from "./src/routers/contactRoutes.js";
import AuthRouter from "./src/routers/authRouter.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", AuthRouter);
app.use("/contact", ContactRouter);

// Default Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const errorMessage = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  console.error("Error Found", { errorMessage, statusCode });
  res.status(statusCode).json({ message: errorMessage });
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log("Server Started at Port:", port);
  connectDB();
});
