import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// @desc    Protect routes - Verify JWT token
// @access  Private routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists in Authorization header (Bearer Token)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login to access this resource.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User not found. Token is invalid.",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          message: "Your account has been deactivated.",
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Protect Middleware Error:", error);
    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

// @desc    Authorize specific roles
// @access  Private routes with role restriction
// @usage   authorize('admin', 'manager')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

// @desc    Optional authentication - Don't block if no token
// @access  Public routes that benefit from auth context
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log("Optional auth failed:", error.message);
      }
    }

    next();
  } catch (error) {
    console.error("Optional Auth Middleware Error:", error);
    next();
  }
};
