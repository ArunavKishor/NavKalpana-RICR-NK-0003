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

// Temporary handler for unimplemented OTP/password reset routes
const otpNotImplemented = (req, res) => {
  return res.status(501).json({
    message:
      "Password reset feature is coming soon. OTP service not yet implemented.",
    status: "Not Implemented",
  });
};

// Public routes
router.post("/register", register);
router.post("/login", login);
// Disabled until OTP flow is securely implemented
router.post("/genOtp", otpNotImplemented);
router.post("/verifyOtp", otpNotImplemented);
router.post("/forgetPasword", otpNotImplemented); // Keeping typo to match frontend

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Admin only example route (you can add more protected routes)
// router.get("/admin/users", protect, authorize("admin"), getAllUsers);

export default router;
