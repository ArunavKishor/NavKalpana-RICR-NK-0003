import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./src/config/db.js";
import AuthRouter from "./src/routers/authRouter.js";
import PublicRouter from "./src/routers/publicRouter.js";
import UserRouter from "./src/routers/userRouter.js";
import RestaurantRouter from "./src/routers/restaurentRouter.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/auth", AuthRouter);
app.use("/public", PublicRouter);
app.use("/user", UserRouter);
app.use("/restaurant", RestaurantRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});

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
