import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  generateOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/genOtp", generateOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/forgetPasword", resetPassword); // Keeping typo to match frontend

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Admin only example route (you can add more protected routes)
// router.get("/admin/users", protect, authorize("admin"), getAllUsers);

export default router;
