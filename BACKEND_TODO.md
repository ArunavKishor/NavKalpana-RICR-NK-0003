# 🚀 BACKEND TODO - What You Need to Build

## Your Teacher Module Frontend is COMPLETE ✅

All the UI, routing, and API integration code is ready. Now you need to build/enhance these backend features to make everything work:

---

## 🔴 CRITICAL - Do These First (Blocking Core Features)

### 1. **Attendance Remarks - MANDATORY Field**

**Files to Update:**

- `server/src/models/attendanceModel.js` - Add fields
- `server/src/controllers/attendanceController.js` - Add validation

```javascript
// In attendanceModel.js ADD:
remarks: {
  type: String,
  required: true, // MANDATORY before submission
  trim: true
},
submittedAt: {
  type: Date,
  default: Date.now
}

// In attendanceController.js - POST /api/attendance
// Validate: if (!remarks || !remarks.trim()) return error
```

### 2. **Attendance Edit Time-Lock (10 minutes)**

**Files to Update:**

- `server/src/controllers/attendanceController.js` - PUT route

```javascript
// In attendanceController.js - PUT /api/attendance/{id}
// Add logic:
const record = await Attendance.findById(id);
const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
const sameDate = isSameDay(record.date, new Date());
const withinTimeLock = record.submittedAt > tenMinutesAgo;

if (!sameDate || !withinTimeLock) {
  return res.status(403).json({
    message: "Cannot edit attendance. Only within 10 mins of same date.",
  });
}
// Allow edit
```

### 3. **Dashboard Statistics Endpoints** (3 new endpoints)

**Files to Create/Update:**

- `server/src/controllers/dashboardController.js` - Add new functions

```javascript
// NEW ENDPOINTS NEEDED:

// 1. GET /api/dashboard/stats/teacher
export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get all batches for teacher
    const batches = await Batch.find({ createdBy: teacherId });
    const batchIds = batches.map(b => b._id);

    // Count total students
    const totalStudents = await Student.countDocuments({
      batches: { $in: batchIds }
    });

    // Count pending assignments
    const pendingAssignments = await Assessment.countDocuments({
      batch: { $in: batchIds },
      type: "assignment",
      "submissions.status": { $ne: "evaluated" }
    });

    // Count completed grades
    const completedGrades = await Submission.countDocuments({
      status: "evaluated",
      assessment: { /* batch check */ }
    });

    res.status(200).json({
      data: {
        totalStudents,
        pendingAssignments,
        completedGrades,
        activeBatches: batches.filter(b => b.status === "ongoing").length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get stats" });
  }
};

// 2. GET /api/dashboard/performance
export const getPerformanceData = async (req, res) => {
  try {
    // Calculate class performance (weekly averages)
    // Calculate low-performing students (avg < 65%)
    res.status(200).json({
      data: {
        studentPerformance: [...]
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get performance data" });
  }
};

// 3. GET /api/dashboard/deadlines
export const getUpcomingDeadlines = async (req, res) => {
  try {
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const deadlines = await Assessment.find({
      dueDate: {
        $gte: new Date(),
        $lte: next7Days
      }
    }).limit(5);

    res.status(200).json({ data: deadlines });
  } catch (error) {
    res.status(500).json({ message: "Failed to get deadlines" });
  }
};
```

**Add to routes:**

```javascript
// In dashboardRoutes.js
router.get(
  "/stats/teacher",
  protect,
  authorize("teacher", "admin"),
  getTeacherStats,
);
router.get("/performance", protect, getPerformanceData);
router.get("/deadlines", protect, getUpcomingDeadlines);
```

---

## 🟠 HIGH - Important Features

### 4. **Assessment Submission File Handling**

**Files to Update:**

- `server/src/models/submissionModel.js` - Add file field
- `server/src/models/assessmentModel.js` - Add submissionType

```javascript
// In submissionModel.js ADD:
fileUrl: String, // Cloudinary URL
fileName: String,
fileType: String,
submittedAt: Date,
isLateSubmission: Boolean,
marks: Number,
feedback: String,
evaluatedAt: Date

// In assessmentModel.js ADD:
submissionType: {
  type: String,
  enum: ['PDF', 'Image', 'JPG', 'Video', 'Text'],
  default: 'PDF'
}
```

### 5. **Late Submission Detection** (Don't block, just flag)

**Files to Update:**

- `server/src/controllers/assessmentController.js`

```javascript
// When receiving submission, calculate:
const isLate = submissionDate > assignmentDueDate;

// Save to submission:
const submission = new Submission({
  student,
  assessment,
  submission,
  isLateSubmission: isLate,
  status: isLate ? "late-submitted" : "submitted",
});

// DON'T reject - just flag it
```

### 6. **Student Profile & Progress Endpoints**

**Files to Create/Update:**

- `server/src/controllers/studentController.js`

```javascript
// Add new functions:

// GET /api/students/{id}/progress
export const getStudentProgress = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("batches");

    // Calculate:
    // - Module-wise completion
    // - Assignment summary (submitted/evaluated)
    // - Quiz summary (attempts/scores)
    // - Overall progress %

    res.status(200).json({ data: progressData });
  } catch (error) {
    res.status(500).json({ message: "Failed to get progress" });
  }
};

// GET /api/students/{id}/attendance
export const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      student: req.params.id,
    });

    // Calculate totals
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;

    res.status(200).json({
      data: {
        total,
        present,
        absent,
        late,
        percentage: (((present + late) / total) * 100).toFixed(2),
        records,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get attendance" });
  }
};
```

### 7. **Assessment Submission Evaluation**

**Files to Update:**

- `server/src/controllers/assessmentController.js`

```javascript
// NEW: POST /api/assessments/{id}/submissions/{subId}/evaluate
export const evaluateSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;

    const submission = await Submission.findById(req.params.subId);
    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = "evaluated";
    submission.evaluatedAt = new Date();
    await submission.save();

    res.status(200).json({
      message: "Submission evaluated",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to evaluate" });
  }
};
```

---

## 🟡 MEDIUM - Nice to Have

### 8. **Support Request Reply System**

```javascript
// POST /api/support/{id}/reply
// POST /api/support/{id}/solution (file upload)
// PUT /api/support/{id} (mark resolved)
```

### 9. **Export Attendance**

```javascript
// POST /api/attendance/export
// Generate CSV/PDF and send
```

### 10. **Quiz Statistics**

```javascript
// GET /api/quizzes/{id}/attempts
// GET /api/quizzes/{id}/statistics
```

---

## ✅ Implementation Priority

| Priority    | Tasks      | Est. Time  |
| ----------- | ---------- | ---------- |
| 🔴 CRITICAL | Tasks 1-3  | 2-3 days   |
| 🟠 HIGH     | Tasks 4-7  | 3-4 days   |
| 🟡 MEDIUM   | Tasks 8-10 | 2-3 days   |
| ✅ TOTAL    | All Items  | ~1-2 weeks |

---

## 🧪 Quick Test Checklist

After implementing, test in this order:

- [ ] Login as teacher → See dashboard with stats
- [ ] Go to Batches → See batch list
- [ ] Click "Manage" on batch → See batch detail
- [ ] Click "Mark Attendance" → Mark attendance and **add remarks**
- [ ] Try to mark attendance without remarks → Should error
- [ ] Click "Assessment" → See assignments/quizzes
- [ ] Go to Students → See student list
- [ ] All navigation works smoothly

---

## 📁 Files You'll Be Modifying

```
server/src/
├── models/
│   ├── attendanceModel.js (ADD: remarks, submittedAt)
│   ├── submissionModel.js (ADD: fileUrl, marks, feedback, etc)
│   └── assessmentModel.js (ADD: submissionType)
│
├── controllers/
│   ├── attendanceController.js (ADD: 10-min edit lock)
│   ├── dashboardController.js (ADD: 3 new functions)
│   ├── assessmentController.js (ADD: evaluation endpoint)
│   └── studentController.js (ADD: progress endpoint)
│
└── routers/
    ├── attendanceRoutes.js (MAYBE: new routes)
    ├── dashboardRoutes.js (ADD: 3 new routes)
    ├── assessmentRoutes.js (ADD: 1 new route)
    └── studentRoutes.js (ADD: 2 new routes)
```

---

## 🎯 Summary

**Frontend: ✅ 100% Complete** - All components, routing, API calls ready

**Backend: ⏳ 40% Complete** - Need database enhancements and new endpoints

**Estimated Backend Time: 1-2 weeks** with standard development pace

---

**Want specific code examples?** Check the detailed documentation in:

- `TEACHER_MODULE_IMPLEMENTATION.md` - Full feature breakdown
- `TEACHER_MODULE_SUMMARY.md` - Complete checklist with API specs

All frontend code is production-ready. Let's build that backend! 🚀
