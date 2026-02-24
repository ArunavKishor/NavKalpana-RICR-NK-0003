# IMMEDIATE FIXES — Code Change Checklist

**Time to Complete:** ~2 hours  
**Complexity:** Medium  
**Blocking Issues:** Yes (prevents production deployment)

---

## ✅ FIX #1: Force role to "student" on Register

**File:** `backend/src/controllers/authController.js`  
**Line:** ~47  
**Time:** 5 minutes  
**Severity:** 🔴 CRITICAL

### Current Code (BUGGY)


```javascript
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;  // ❌ Takes role from input

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields: fullName, email, password",
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
      role: role || "student",  // ❌ DANGEROUS: Allows admin/teacher role
    });
```

### Fixed Code

```javascript
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;  // ✅ Removed role from destructuring

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields: fullName, email, password",
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
      role: "student",  // ✅ HARDCODED: Always student role
    });
```

### Test It

```bash
# Try to register with admin role - should still be student
curl -X POST http://localhost:4500/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "admin"
  }'

# Response should have role: "student" not "admin"
```

---

## ✅ FIX #2: Dashboard Query Bug - Use Assessment IDs

**File:** `backend/src/controllers/dashboardController.js`  
**Lines:** ~247 and ~280  
**Time:** 1 hour  
**Severity:** 🔴 CRITICAL

### Current Code (BUGGY)

**Around Line 220-250:**

```javascript
export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get all batches for teacher
    const batches = await Batch.find({ createdBy: teacherId, isActive: true });
    const batchIds = batches.map((b) => b._id);

    // Count total students enrolled in teacher's batches
    const totalStudents = await Student.countDocuments({
      batches: { $in: batchIds },
      isActive: true,
    });

    // Count pending assignments (not yet evaluated)
    const pendingAssignments = await Assessment.countDocuments({
      batch: { $in: batchIds },
      type: "assignment",
      status: "published",
      isActive: true,
    });

    // Count completed grades (evaluated submissions)
    const completedGrades = await Submission.countDocuments({
      assessment: { $in: batchIds },  // ❌ WRONG: Batch IDs passed
      submissionStatus: "evaluated",
    });
```

### Fixed Code

```javascript
export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get all batches for teacher
    const batches = await Batch.find({ createdBy: teacherId, isActive: true });
    const batchIds = batches.map((b) => b._id);

    // Count total students enrolled in teacher's batches
    const totalStudents = await Student.countDocuments({
      batches: { $in: batchIds },
      isActive: true,
    });

    // Count pending assignments (not yet evaluated)
    const pendingAssignments = await Assessment.countDocuments({
      batch: { $in: batchIds },
      type: "assignment",
      status: "published",
      isActive: true,
    });

    // ✅ FIXED: Get assessments first, then use their IDs
    const assessments = await Assessment.find({
      batch: { $in: batchIds },
      isActive: true,
    });
    const assessmentIds = assessments.map((a) => a._id);

    // Count completed grades (evaluated submissions)
    const completedGrades = await Submission.countDocuments({
      assessment: { $in: assessmentIds },  // ✅ NOW using Assessment IDs
      status: "evaluated",  // ✅ Use 'status' field (not 'submissionStatus')
    });
```

### Also Fix: getTeacherPerformance (Line ~280)

**Find this code around line 280:**

```javascript
export const getTeacherPerformance = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const batches = await Batch.find({ createdBy: teacherId, isActive: true });
    const batchIds = batches.map((b) => b._id);

    // ❌ SAME BUG HERE
    const submissions = await Submission.find({
      assessment: { $in: batchIds },  // ❌ Batch IDs, not Assessment IDs
    }).populate("assessment");
```

**Fix it the same way:**

```javascript
export const getTeacherPerformance = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const batches = await Batch.find({ createdBy: teacherId, isActive: true });
    const batchIds = batches.map((b) => b._id);

    // ✅ Get assessments first
    const assessments = await Assessment.find({
      batch: { $in: batchIds },
      isActive: true,
    });
    const assessmentIds = assessments.map((a) => a._id);

    // ✅ Now use Assessment IDs
    const submissions = await Submission.find({
      assessment: { $in: assessmentIds },  // ✅ Assessment IDs
    }).populate("assessment");
```

### Test It

In Postman or frontend:

```
GET http://localhost:4500/api/dashboard/stats
```

Check that `completedGrades` is not 0 and matches actual evaluated submissions.

---

## ✅ FIX #3: Disable OTP Routes (Temporary)

**File:** `backend/src/routers/authRouter.js`  
**Time:** 5 minutes  
**Severity:** 🟡 RECOMMENDED

### Current Code

```javascript
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
router.post("/genOtp", generateOtp); // ⚠️ Not implemented
router.post("/verifyOtp", verifyOtp); // ⚠️ Accepts any OTP
router.post("/forgetPasword", resetPassword); // ⚠️ No OTP gate

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
```

### Fixed Code (Temporary)

```javascript
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
// router.post("/genOtp", generateOtp);  // ✅ DISABLED: OTP not yet implemented
// router.post("/verifyOtp", verifyOtp);  // ✅ DISABLED: OTP not yet implemented
// router.post("/forgetPasword", resetPassword);  // ✅ DISABLED: No OTP verification gate

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
```

### Alternative (Better): Return "Not Implemented"

```javascript
const otp NotImplemented = (req, res) => {
  return res.status(501).json({
    message: "Password reset feature is coming soon. OTP service not yet implemented.",
    status: "Not Implemented"
  });
};

router.post("/genOtp", otpNotImplemented);
router.post("/verifyOtp", otpNotImplemented);
router.post("/forgetPasword", otpNotImplemented);
```

---

## ✅ FIX #4: Add Helmet Security Headers

**File:** `backend/server.js`  
**Time:** 15 minutes  
**Severity:** 🟡 RECOMMENDED

### Install Package

```bash
cd backend
npm install helmet express-rate-limit
```

### Add to server.js

**Find this section (around line 24):**

```javascript
const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
```

**Add helmet and rate limit:**

```javascript
import helm from "helmet"; // ✅ Add this import at top
import rateLimit from "express-rate-limit"; // ✅ Add this import at top

const app = express();

// ✅ Security Middleware (add BEFORE other middleware)
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  }),
);

// ✅ Middleware (existing)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
```

---

## ✅ FIX #5 (OPTIONAL): Add Upload File Size Limit

**File:** `backend/src/middlewares/uploadMiddleware.js`  
**Time:** 5 minutes  
**Severity:** 🟢 NICE TO HAVE

### Current Code

```javascript
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hac_uploads",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

export default upload;
```

### With File Size Limit

```javascript
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "hac_uploads",
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // ✅ 10MB max file size
  },
});

export default upload;
```

---

## 📋 CHECKLIST — Do These In Order

- [ ] **Fix #1** (5 min) — Force role to "student"
  - Edit `authController.js` line 47
  - Remove `role` parameter, hardcode to "student"
  - Test: curl with role="admin" → should create student

- [ ] **Fix #2** (1 hour) — Dashboard queries
  - Edit `dashboardController.js` lines ~247 and ~280
  - Change: `{ $in: batchIds }` to `{ $in: assessmentIds }`
  - Need to get assessmentIds first
  - Test: Check dashboard KPIs in frontend

- [ ] **Fix #3** (5 min) — Disable OTP routes
  - Edit `authRouter.js`
  - Comment out 3 OTP-related routes
  - OR return 501 "Not Implemented"

- [ ] **Fix #4** (15 min) — Add Helmet + Rate Limiting
  - Install: `npm install helmet express-rate-limit`
  - Add imports to `server.js`
  - Add middleware before CORS

- [ ] **Fix #5 OPTIONAL** (5 min) — File size limits
  - Edit `uploadMiddleware.js`
  - Add `limits: { fileSize: 10mb }`

- [ ] **Test Everything** (30 min)
  - Run backend: `npm run dev`
  - Run frontend: `npm run dev`
  - Test login → dashboard → check KPI values
  - Try registering with role="admin"
  - Check browser network tab for security headers

---

## ✅ Expected Results After Fixes

| Issue                    | Before         | After              |
| ------------------------ | -------------- | ------------------ |
| Self-assign admin        | ❌ Possible    | ✅ Impossible      |
| Dashboard shows 0 grades | ❌ Wrong       | ✅ Correct counts  |
| Password reset           | ⚠️ Unprotected | ✅ Disabled (safe) |
| Security headers         | ❌ Missing     | ✅ Added (helmet)  |
| Rate limiting            | ❌ None        | ✅ 100 req/15min   |
| File uploads             | ❌ Unlimited   | ✅ 10MB max        |

---

## ⏱️ Timeline

- **Fix #1:** ← START HERE (5 mins)
- **Fix #2:** (1 hour)
- **Fix #3:** (5 mins)
- **Fix #4:** (15 mins)
- **Testing:** (30 mins)
- **Total:** ~1.75 hours

**Then:** Commit changes and push to staging!

---

**Last Updated:** February 24, 2026  
**Priority:** 🔴 DO THIS NOW
