import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./src/config/db.js";
import AuthRouter from "./src/routers/authRouter.js";
// ❗ If contactRouter file does NOT exist, comment next line
// import ContactRouter from "./src/routers/contactRouter.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", AuthRouter);

// ❗ Uncomment ONLY if file exists
// app.use("/api/contact", ContactRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const errorMessage = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;

  console.error("Error Found:", errorMessage);
  res.status(statusCode).json({ message: errorMessage });
});

const port = process.env.PORT || 5000;

// ✅ Connect DB first, then start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server Started at Port: ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server ❌", error);
  }
};

startServer();
