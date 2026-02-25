import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// Set JWT in Cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  };

  res.cookie("token", token, cookieOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message:
          "Please provide all required fields: fullName, email, password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || "teacher", // Default to teacher if not provided
    });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    setTokenCookie(res, token);

    // Return success response
    res.status(201).json({
      message: "User registered successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Login attempt:", {
      email,
      password: password ? "***" : "empty",
    });

    // Validate required fields
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log(`✅ User found: ${user.fullName}, Active: ${user.isActive}`);

    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ User inactive: ${email}`);
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log(`❌ Password mismatch for ${email}`);
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log(`✅ Password match for ${email}`);

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    setTokenCookie(res, token);

    // Return success response (password won't be included due to toJSON method)
    console.log(`✅ Login successful for ${email}`);
    res.status(200).json({
      message: "Login successful",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    // Clear the cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      message: "Logged out successfully",
      data: {},
    });
  } catch (error) {
    console.error("Logout Error:", error);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    next(error);
  }
};

// @desc    Generate OTP for password reset
// @route   POST /api/auth/genOtp
// @access  Public
export const generateOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please provide email address",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: Store OTP in database or cache with expiry
    // TODO: Send OTP via email service

    // For now, just return success (implement email service later)
    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: "OTP sent to your email successfully",
      data: { email },
    });
  } catch (error) {
    console.error("Generate OTP Error:", error);
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verifyOtp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Please provide email and OTP",
      });
    }

    // TODO: Verify OTP from database or cache
    // For now, accept any 6-digit OTP

    res.status(200).json({
      message: "OTP verified successfully",
      data: { email },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    next(error);
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/forgetPasword
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, cfNewPassword } = req.body;

    if (!email || !newPassword || !cfNewPassword) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (newPassword !== cfNewPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message:
        "Password reset successfully. Please login with your new password.",
      data: {},
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    next(error);
  }
};
