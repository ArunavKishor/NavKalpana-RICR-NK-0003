# NavKalpana (Mind Rise) - Remaining Tasks

> Items pending implementation based on PRD audit
> Last Updated: February 2026

---

## Summary

| Priority | Count | Category                              |
| -------- | ----- | ------------------------------------- |
| Critical | 4     | Must-fix issues in existing code      |
| High     | 12    | Core PRD features not yet implemented |
| Medium   | 14    | Enhancement features from PRD         |
| Low      | 8     | Nice-to-have / optional PRD items     |

---

## Critical (Must Fix)

### C1. Submission Model Has Duplicate Fields

- **File**: `backend/src/models/submissionModel.js`
- **Issue**: `fileUrl`, `fileType`, and `isLateSubmission` are each defined twice in the schema with conflicting enum values
- **Also**: `status` and `submissionStatus` both track the same concept, creating confusion in controller code
- **Fix**: Remove duplicate fields, consolidate to single status field

### C2. Frontend Logout Does Not Call Backend API

- **File**: `frontend/src/components/dashboard/DashboardHeader.jsx`, `TeacherDashboardHeader.jsx`
- **Issue**: Logout only clears sessionStorage, never calls `POST /api/auth/logout` (which clears the HTTP-only cookie)
- **Fix**: Add `api.post("/api/auth/logout")` call before clearing storage

### C3. Delete Support Request Endpoint Missing

- **File**: `frontend/src/pages/dashboards/admin/AdminSupport.jsx` calls `api.delete()` but no backend DELETE route exists
- **Fix**: Add `DELETE /:id` route and controller in `supportRoutes.js` / `supportController.js`

### C4. Leaderboard Course Filter Not Functional

- **File**: `backend/src/controllers/analyticsController.js` (line ~727)
- **Issue**: `course` query parameter is accepted but not applied to the filter query in the leaderboard function
- **Fix**: Apply course filter to batch query before building leaderboard

---

## High Priority (Core PRD Features)

### H1. Real-Time Dashboard Updates

- **PRD**: "Cards must dynamically update when students enrolled/removed, courses created/archived, assignments evaluated"
- **Current**: Dashboard data loads once on mount, no auto-refresh
- **Action**: Add polling mechanism (30-60s `setInterval`) or implement WebSocket (Socket.io) for real-time updates
- **Files**: `TeacherDashboardHome.jsx`, `AdminDashboardHome.jsx`

### H2. Quiz Attempt History Endpoint

- **PRD**: "View attempts" for quizzes
- **Current**: Can submit quiz attempts (`POST /api/assessments/:id/attempts`) but no GET endpoint to retrieve attempt history
- **Action**: Add `GET /api/assessments/:id/attempts` endpoint returning paginated list of all attempts for a quiz
- **Files**: `assessmentController.js`, `assessmentRoutes.js`

### H3. "Not Submitted" Student Tracking

- **PRD**: Assignment status should include "Not Submitted"
- **Current**: Only tracks students who have submitted; no query for students who haven't
- **Action**: Cross-reference enrolled batch students against submission records to identify missing submissions
- **Files**: `assessmentController.js` (new endpoint or enhance `getAssessmentSubmissions`)

### H4. Backup Class Approval Workflow

- **PRD**: "Teachers must also approve or schedule backup classes"
- **Current**: Can schedule backup classes but no approval status tracking or approve endpoint
- **Action**:
  - Add `approvalStatus` field to `backupClassSchedule` in `supportRequestModel.js`
  - Add approve endpoint: `PUT /api/support/:id/approve-backup`
  - Connect `SupportBackupClasses.jsx` to real backend data (currently hardcoded mock)
- **Files**: `supportRequestModel.js`, `supportController.js`, `supportRoutes.js`, `SupportBackupClasses.jsx`

### H5. Solution File Upload (Not Just URL)

- **PRD**: "Upload solution files" for support requests
- **Current**: TeacherSupport only accepts a URL string for solution, no file upload UI
- **Action**: Add file input with Cloudinary upload for solution files in resolve dialog
- **Files**: `TeacherSupport.jsx` (resolve dialog section)

### H6. Admin Student Detail Modal - Missing Tabs

- **PRD**: Student Detail Modal must include Course Information, Progress, and Attendance tabs
- **Current Admin Modal**: Has Overview (batch enrollment), Progress (attendance only), Attendance (list view only)
- **Missing**: Assignment summary, Quiz summary, Overall Progress %, Calendar view, Weekly Activity chart
- **Action**: Bring admin modal closer to teacher modal quality by adding assignment/quiz data and calendar
- **Files**: `AdminStudentDetailModal.jsx`

### H7. GitHub & LinkedIn Links in Student Table

- **PRD**: Student table must display GitHub & LinkedIn
- **Current**: Only shown in teacher StudentDetailModal (info tab), not in table or admin modal
- **Action**: Add GitHub/LinkedIn columns to student table (or as hover/tooltip) and to admin detail modal
- **Files**: `TeacherStudentManagement.jsx`, `AdminStudents.jsx`, `AdminStudentDetailModal.jsx`

### H8. Batch Type Field

- **PRD**: Each batch card must display "Batch Type (e.g., WEB Batch, DSA Batch)"
- **Current**: `TeacherBatchManagement.jsx` references `batch.type` but this field doesn't exist in the Batch model
- **Action**: Add `type` field to `batchModel.js` and `AdminBatchForm.jsx`
- **Files**: `batchModel.js`, `AdminBatchForm.jsx`, `TeacherBatchManagement.jsx`

### H9. Admin Support - Course/Topic Filter & Attachment Preview

- **PRD**: Support page must include course filter, topic filter, attachment preview
- **Current Admin Support**: Has status/priority filter but no course filter, no topic filter, no attachment preview
- **Action**: Port course/topic filter and attachment preview from `TeacherSupport.jsx` to `AdminSupport.jsx`
- **Files**: `AdminSupport.jsx`

### H10. Doubts & Queries Component Connected to Real Data

- **PRD**: View doubts, filter by course and topic
- **Current**: `SupportDoubtsQueries.jsx` uses hardcoded mock data, not connected to backend
- **Action**: Connect to `/api/support` endpoint with proper filtering
- **Files**: `SupportDoubtsQueries.jsx`

### H11. Week-to-Week Performance Comparison

- **PRD**: "Compare week-to-week performance, identify improvement trends, identify declining performance, detect stagnation"
- **Current**: Weekly snapshots are stored but no explicit delta/comparison calculations
- **Action**: Add calculated fields (week-over-week change %, trend direction) to the weekly snapshots response
- **Files**: `analyticsController.js` (enhance `getStudentWeeklySnapshots`)

### H12. Leaderboard Auto-Update

- **PRD**: "Leaderboard data must update automatically whenever assignment evaluations occur, quiz results published, attendance records change"
- **Current**: Leaderboard only fetches on page load/filter change, no auto-refresh
- **Action**: Add polling (30-60s) or WebSocket push for leaderboard data
- **Files**: `TeacherAnalytics.jsx`

---

## Medium Priority (Enhancements)

### M1. Date-wise Remarks in Student Attendance View

- **PRD**: Attendance tab should show "Date-wise remarks"
- **Current**: Remarks are stored and shown in batch attendance history but not displayed in student detail modal attendance tab
- **Files**: `StudentDetailModal.jsx` (attendance tab), `AdminStudentDetailModal.jsx`

### M2. Module-wise Attendance Breakdown (True Per-Module)

- **PRD**: "Module-wise attendance breakdown"
- **Current**: Attendance analytics are batch-level only, not broken down by individual modules within a batch
- **Files**: `attendanceController.js`, `TeacherBatchDetail.jsx`

### M3. Attendance Badge in Student Modal Header

- **PRD**: Student Detail Modal header should include "Attendance Badge"
- **Current**: Header shows status badge but no attendance badge
- **Files**: `StudentDetailModal.jsx`, `AdminStudentDetailModal.jsx`

### M4. Course Display in Student Modal Header

- **PRD**: Student Detail Modal header should show "Course"
- **Current**: Course shown in tabs but not in the modal header
- **Files**: `StudentDetailModal.jsx`, `AdminStudentDetailModal.jsx`

### M5. Admin Calendar View for Attendance

- **PRD**: Calendar view in student attendance tab
- **Current**: Teacher modal has calendar, admin modal only has list view
- **Files**: `AdminStudentDetailModal.jsx`

### M6. Dummy/Seed Data for Courses

- **PRD**: "There Should be Dummy Course"
- **Current**: Only admin seeder exists, no course/batch seed data
- **Action**: Create seed script for sample batches, courses, and student data
- **Files**: New file `backend/src/seeders/seedCourses.js`

### M7. Pending Assignments Count Refinement

- **PRD**: "Pending Assignments for Evaluation" KPI
- **Current**: Counts all published assignments, not specifically those with unevaluated submissions
- **Action**: Query submissions with status != "evaluated" for accurate pending count
- **Files**: `dashboardController.js` (`getTeacherStats`)

### M8. Support Statistics Visualization

- **PRD**: Support statistics endpoint exists
- **Current**: `GET /api/support/statistics` returns data but no frontend chart/card displays it
- **Action**: Add stats cards or chart to `TeacherSupport.jsx` header area
- **Files**: `TeacherSupport.jsx`

### M9. Analytics Export (CSV/PDF)

- **PRD**: "Optional: Download individual student performance report (PDF or CSV format)"
- **Current**: Only attendance CSV export exists; no full analytics export
- **Action**: Add export button to analytics page that generates CSV/PDF of class or student performance
- **Files**: `TeacherAnalytics.jsx`, possibly `analyticsController.js` (new endpoint)

### M10. QuizAttempt In-Progress Status

- **PRD**: Quiz should support timed attempts
- **Current**: `QuizAttempt` model has "in-progress" status but it's never set; all attempts go directly to "evaluated"
- **Action**: Implement quiz start flow (create attempt as "in-progress") and completion flow (update to "evaluated")
- **Files**: `assessmentController.js`, potentially new frontend quiz-taking component

### M11. Skills Tracking in Admin Modal

- **PRD**: Student modal should show "Skills Acquired"
- **Current**: Only shown in teacher StudentDetailModal, not in admin version
- **Files**: `AdminStudentDetailModal.jsx`

### M12. Learning Streak in Admin Modal

- **PRD**: Student modal should show "Learning Streak"
- **Current**: Only shown in teacher StudentDetailModal
- **Files**: `AdminStudentDetailModal.jsx`

### M13. Student-Accessible Attendance Endpoint

- **PRD**: Attendance records must be visible in student context
- **Current**: `getMyAttendance()` function exists in `attendanceController.js` but is NOT exposed in routes
- **Action**: Add route `GET /api/attendance/my` with student role authorization
- **Files**: `attendanceRoutes.js`

### M14. Teacher Sidebar - Missing Student Management Link

- **PRD**: Sidebar should include "Student Management"
- **Current**: Students link was recently removed from teacher sidebar
- **Action**: Consider re-adding if PRD requires it, or keep removed if intentionally scoped out
- **Files**: `TeacherDashboardSidebar.jsx`

---

## Low Priority (Nice-to-Have)

### L1. Session Inactivity Timeout

- **PRD**: "Session timeout (approximately 24 hours)"
- **Current**: JWT expires in 24h but no client-side inactivity detection
- **Action**: Add idle timer that warns/logs out after period of inactivity
- **Files**: `AuthContext.jsx` or new `useIdleTimer` hook

### L2. Token Refresh Mechanism

- **Current**: No JWT refresh token; only reactive 401 handling
- **Action**: Implement refresh token flow for seamless session extension
- **Files**: `authController.js`, `Api.jsx`, `AuthContext.jsx`

### L3. Rate Limiting on Auth Routes

- **Current**: `express-rate-limit` was installed but implementation was reverted by linter
- **Action**: Re-implement rate limiting correctly (authLimiter on `/api/auth`, apiLimiter globally)
- **Files**: `server.js`

### L4. Password Strength Requirements

- **Current**: Minimum 6 characters, no complexity rules
- **Action**: Enforce min 8 chars, uppercase, lowercase, number requirement
- **Files**: `userModel.js`, `Login.jsx` (validation feedback)
 
### L5. Consistent Token Storage Strategy

- **Current**: Multiple inconsistent storage keys (`token`, `AdminToken`, `Token`) checked by Axios interceptor
- **Action**: Consolidate to a single key ecosystem
- **Files**: `Api.jsx`, `AuthContext.jsx`, `Login.jsx`

### L6. Anomaly Detection in Performance Snapshots

- **PRD**: "Detect performance stagnation"
- **Current**: Only growth classification (4 levels), no detailed anomaly detection
- **Action**: Add trend vector (improving/declining/stagnating) with percentage change
- **Files**: `analyticsController.js`

### L7. Backup Class Calendar View

- **PRD**: Teachers must be able to manage backup classes
- **Current**: Backup class scheduling exists but no calendar/list view of all scheduled classes
- **Action**: Create dedicated backup class management view
- **Files**: New component or extend `TeacherSupport.jsx`

### L8. Support Statistics in Dashboard

- **PRD**: Support ticket counts as part of teacher awareness
- **Current**: Support stats endpoint exists but not displayed anywhere in dashboard KPIs
- **Action**: Optionally add support ticket count to teacher dashboard
- **Files**: `TeacherDashboardHome.jsx`

---

## Implementation Priority Matrix

```
                    IMPACT
              Low         High
         ┌──────────┬──────────┐
  Easy   │ L1-L8    │ H7, H8   │
EFFORT   │          │ H9, H10  │
         ├──────────┼──────────┤
  Hard   │ M10, M13 │ H1, H4   │
         │ M6       │ H2, H3   │
         │          │ H11, H12 │
         └──────────┴──────────┘
```

### Recommended Order of Implementation:

1. **Critical fixes first** (C1-C4) - These are bugs/issues in existing code
2. **High-impact, low-effort** (H7, H8, H9, H10) - UI additions using existing patterns
3. **Core PRD gaps** (H2, H3, H4, H5, H6) - New functionality required by PRD
4. **Real-time features** (H1, H11, H12) - Infrastructure work for auto-updates
5. **Medium priority items** (M1-M14) as time permits
6. **Low priority** (L1-L8) for polish

---

_This document tracks remaining work based on a comprehensive code audit against the Teacher Module PRD, February 2026._
