import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/* =========================================
   Helper – Extract Token Safely
========================================= */
const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

/* =========================================
   PROTECT – Authentication Required
========================================= */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found. Token invalid.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("PROTECT ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(401).json({
      message: "Not authorized",
    });
  }
};

/* =========================================
   AUTHORIZE – Role-Based Access Control
========================================= */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          message: "Forbidden. Role not found.",
        });
      }

      const userRole = req.user.role.toLowerCase(); // ✅ Case-proof
      const roles = allowedRoles.map((r) => r.toLowerCase());

      // ✅ Role Hierarchy
      // admin > teacher > student
      if (userRole === "admin") return next();

      if (roles.includes(userRole)) return next();

      if (userRole === "teacher" && roles.includes("student")) {
        return next();
      }

      return res.status(403).json({
        message: `Role '${req.user.role}' not permitted.`,
      });
    } catch (error) {
      console.error("AUTHORIZE ERROR:", error.message);

      return res.status(403).json({
        message: "Forbidden",
      });
    }
  };
};

/* =========================================
   OPTIONAL AUTH – Do Not Block
========================================= */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silent failure is correct here
      console.log("Optional auth skipped:", error.message);
    }

    next();
  } catch (error) {
    console.error("OPTIONAL AUTH ERROR:", error.message);
    next();
  }
};