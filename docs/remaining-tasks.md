# NavKalpana (Mind Rise) — Remaining Tasks

> Items pending implementation based on PRD audit + live codebase verification
> Last Updated: February 2026

---

## Summary

| Priority | Count | Category                              |
| -------- | ----- | ------------------------------------- |
| Critical | 0     | All critical bugs resolved            |
| High     | 0     | All high priority features resolved   |
| Medium   | 9     | Enhancement features from PRD         |
| Low      | 8     | Nice-to-have / optional PRD items     |

---

## Critical — All Resolved

The following critical bugs have been fixed:

| ID | Issue | Resolution |
|----|-------|-----------|
| C1 | Duplicate fields in `submissionModel.js` | Fixed — all fields are unique, single `status` field |
| C2 | Frontend logout not calling backend API | Fixed — `AuthContext.jsx` calls `POST /api/auth/logout` |
| C3 | DELETE `/api/support/:id` endpoint missing | Fixed — route and controller implemented |
| C4 | Leaderboard course filter not applied | Fixed — `if (course) batchFilter.course = course` in `analyticsController.js` |

---

## High Priority — All Resolved

The following high priority features have been implemented:

| ID | Issue | Resolution |
|----|-------|-----------|
| H1 | Admin Student Detail Modal missing academic progress | Fixed — enhanced `progress` tab with OGI stat cards, OGI breakdown bars, submission summary, weekly performance line chart using Recharts |
| H2 | GitHub & LinkedIn links missing from student tables | Fixed — added icon links in `TeacherStudentManagement.jsx` and `AdminStudents.jsx` student detail cells; fields mapped from raw student data |
| H3 | Batch type enum mismatch (`regular/weekend/fast-track/self-paced` vs PRD names) | Fixed — removed `enum` constraint from `batchModel.js` (now free-text String); updated `AdminBatchForm.jsx` to Input field with placeholder "WEB Batch, DSA Batch..."; fixed `TeacherBatchManagement.jsx` `batch.type` → `batch.batchType` |
| H4 | Admin Support missing course/topic filter and attachment preview | Fixed — course & topic filter inputs were already present; added attachment preview section to each request card in `AdminSupport.jsx` with image preview + download links |
| H5 | `AdminSubmissionListModal.jsx` did not exist | Fixed — created new file with dual-panel layout (submission list + evaluation panel), file view/download buttons, marks entry, feedback textarea, submit evaluation action; wired into `AdminStudentDetailModal.jsx` assessments tab with "View All" button |
| H6 | Week-to-week delta not returned by analytics API | Confirmed — `getStudentWeeklySnapshots` in `analyticsController.js` already computes and returns `delta` object with `{ogi, attendancePercentage, quizAverage, assignmentAverage, weeklyLearningHours}` per snapshot |

---

## Medium Priority (Enhancements)

### M1. Date-wise Remarks in Student Attendance Tab

- **PRD**: Attendance tab should show "Date-wise remarks"
- **Current**: Remarks are stored per attendance record but not rendered in the student detail modal's attendance tab
- **Files**: `frontend/src/components/teacher/StudentDetailModal.jsx` (attendance tab), `frontend/src/components/admin/AdminStudentDetailModal.jsx`

### M2. Module-wise Attendance Breakdown

- **PRD**: "Module-wise attendance breakdown"
- **Current**: Attendance stats are batch-level only; no breakdown by individual lesson/module
- **Files**: `backend/src/controllers/attendanceController.js`, `frontend/src/pages/teacher/TeacherBatchDetail.jsx`, `frontend/src/components/teacher/StudentDetailModal.jsx`

### M3. End Batch Button

- **PRD**: Each batch card must have an "End Button"
- **Current**: Batch cards have "Manage" and "Attendance" buttons only; no "End Batch" action
- **Action**: Add an "End" button that sets batch status to completed, with a confirmation dialog before proceeding
- **Files**: `frontend/src/pages/teacher/TeacherBatchManagement.jsx`, `backend/src/controllers/batchController.js`

### M4. Admin Calendar View for Student Attendance

- **PRD**: Calendar view in student attendance tab
- **Current**: Teacher's `StudentDetailModal.jsx` has calendar view; admin's `AdminStudentDetailModal.jsx` only has list view
- **Files**: `frontend/src/components/admin/AdminStudentDetailModal.jsx`

### M5. Support Statistics Visualization

- **PRD**: Support statistics should be visible to teachers
- **Current**: `GET /api/support/statistics` returns data (total, open, in-progress, resolved counts) but no frontend component displays it
- **Action**: Add stats summary cards to the top of `TeacherSupport.jsx`
- **Files**: `frontend/src/pages/teacher/TeacherSupport.jsx`

### M6. Analytics Export (CSV/PDF)

- **PRD**: "Optional: Download individual student performance report (PDF or CSV format)"
- **Current**: Only attendance CSV export exists; no full analytics export
- **Action**: Add export button to analytics page for CSV/PDF of class or individual student performance
- **Files**: `frontend/src/pages/teacher/TeacherAnalytics.jsx`, possibly `backend/src/controllers/analyticsController.js`

### M7. QuizAttempt In-Progress Status

- **PRD**: Quiz should support timed in-progress → completed flow
- **Current**: `QuizAttempt` model has `"in-progress"` status defined but all attempts go directly to `"evaluated"`; no quiz-taking flow exists
- **Action**: Implement quiz start flow (create attempt as "in-progress") and separate completion flow
- **Files**: `backend/src/controllers/assessmentController.js`

### M8. Skills Tracking in Admin Student Modal

- **PRD**: Student modal must show "Skills Acquired"
- **Current**: Skills are shown in teacher `StudentDetailModal.jsx` but not in admin `AdminStudentDetailModal.jsx`
- **Files**: `frontend/src/components/admin/AdminStudentDetailModal.jsx`

### M9. Learning Streak in Admin Student Modal

- **PRD**: Student modal must show "Learning Streak"
- **Current**: Learning streak shown in teacher modal only
- **Files**: `frontend/src/components/admin/AdminStudentDetailModal.jsx`

### M10. Leaderboard Auto-Update

- **PRD**: "Leaderboard data must update automatically whenever assignment evaluations occur, quiz results published, attendance records change"
- **Current**: Leaderboard fetches only on page load or manual filter change
- **Action**: Add 30–60s polling interval for leaderboard data
- **Files**: `frontend/src/pages/teacher/TeacherAnalytics.jsx`

### M11. Weekly Activity Chart in Student Modal Course Info Tab

- **PRD**: Course Information tab must include a "Weekly Activity Chart"
- **Current**: Course Info tab shows summary stats (modules, skills, streak) but no chart
- **Action**: Add a small Recharts bar/line chart showing weekly activity inside the Course Info tab
- **Files**: `frontend/src/components/teacher/StudentDetailModal.jsx`

### M12. Module-wise Attendance Comparison in Analytics

- **PRD** (§7.1): "Module-wise Attendance Comparison" in class performance analytics
- **Current**: `TeacherAnalytics.jsx` shows batch-level stats and heatmap but no module-level attendance comparison chart
- **Action**: Add grouped bar chart comparing attendance across modules
- **Files**: `frontend/src/pages/teacher/TeacherAnalytics.jsx`, `backend/src/controllers/analyticsController.js`

---

## Low Priority (Nice-to-Have)

### L1. Session Inactivity Timeout

- **PRD**: Session timeout (~24 hours with inactivity detection)
- **Current**: JWT expires in 24h but no client-side idle detection
- **Action**: Add idle timer that warns/logs out after inactivity
- **Files**: `frontend/src/context/AuthContext.jsx` or new `useIdleTimer` hook

### L2. Token Refresh Mechanism

- **Current**: No JWT refresh token; only reactive 401 handling
- **Action**: Implement refresh token flow for seamless session extension
- **Files**: `backend/src/controllers/authController.js`, `frontend/src/config/Api.jsx`

### L3. Rate Limiting on Auth Routes

- **Current**: `express-rate-limit` was installed but removed
- **Action**: Re-implement rate limiting on `/api/auth` and globally
- **Files**: `backend/server.js`

### L4. Password Strength Requirements

- **Current**: Minimum 6 characters, no complexity rules
- **Action**: Enforce min 8 chars, uppercase, lowercase, number
- **Files**: `backend/src/models/userModel.js`, `frontend/src/pages/Login.jsx`

### L5. Consistent Token Storage Keys

- **Current**: Multiple inconsistent keys (`token`, `AdminToken`, `Token`) in sessionStorage
- **Action**: Consolidate to one key
- **Files**: `frontend/src/config/Api.jsx`, `frontend/src/context/AuthContext.jsx`

### L6. Anomaly Detection in Snapshots

- **PRD**: "Detect performance stagnation"
- **Current**: Growth classification exists (4 levels) but no stagnation detection logic
- **Action**: Add trend vector (improving/declining/stagnating) with percentage change
- **Files**: `backend/src/controllers/analyticsController.js`

### L7. Backup Class Calendar View

- **PRD**: Manage backup classes with a calendar/timeline view
- **Current**: Backup class scheduling and approval exist but no calendar view of all scheduled classes
- **Action**: Add a list or calendar view of upcoming backup classes
- **Files**: `frontend/src/components/support/SupportBackupClasses.jsx`

### L8. Support Statistics in Dashboard KPIs

- **PRD**: Teacher awareness of open support tickets
- **Current**: Support stats API exists but not shown in dashboard KPI cards
- **Action**: Add "Open Tickets" count to teacher dashboard
- **Files**: `frontend/src/pages/teacher/TeacherDashboardHome.jsx`

### L9. Low-Performing Student Alerts on Dashboard

- **PRD**: "Optional Low-Performing Student Alerts"
- **Current**: No alert panel for students with OGI below 40% or attendance below 50%
- **Action**: Add collapsible alert card listing at-risk students
- **Files**: `frontend/src/pages/teacher/TeacherDashboardHome.jsx`, `backend/src/controllers/dashboardController.js`

---

## Implementation Priority Order

1. **H5** — Create `AdminSubmissionListModal.jsx` + download buttons (core evaluation UX)
2. **H2, H3** — GitHub/LinkedIn in table + batch type fix (quick UI additions)
3. **H1, H4** — Admin student modal tabs + admin support filters
4. **H6** — Week-to-week performance delta calculations
5. **M3** — End Batch button (required by PRD)
6. **M1, M2** — Date-wise remarks and module-wise attendance breakdown
7. **M4–M12** — Modal enhancements and analytics additions
8. **L1–L9** — Polish and security hardening

---

## PRD Compliance Checklist

| PRD Section | Feature | Status |
|-------------|---------|--------|
| §1 Authentication | Email/Password login | ✅ Done |
| §1 Authentication | Role-based access control | ✅ Done |
| §1 Authentication | bcrypt password hashing | ✅ Done |
| §1 Authentication | JWT session management | ✅ Done |
| §1 Authentication | Logout (backend cookie clear) | ✅ Done |
| §1 Authentication | Session inactivity timeout | ❌ Missing (L1) |
| §2 Dashboard | KPI cards (Students, Courses, Pending) | ✅ Done |
| §2 Dashboard | Dynamic card updates (auto-refresh) | ✅ Done |
| §2 Dashboard | Color-coded cards | ✅ Done |
| §2 Dashboard | Upcoming deadlines | ✅ Done |
| §2 Dashboard | Average class performance | ✅ Done |
| §2 Dashboard | Quick navigation buttons | ✅ Done |
| §2 Dashboard | Weekly activity chart | ✅ Done |
| §2 Dashboard | Low-performing student alerts | ❌ Missing (L9) |
| §3.1 Batch Cards | Batch name | ✅ Done |
| §3.1 Batch Cards | Batch type display | ⚠️ Partial (H3 - wrong enum values) |
| §3.1 Batch Cards | Total students enrolled | ✅ Done |
| §3.1 Batch Cards | Progress percentage + bar | ✅ Done |
| §3.1 Batch Cards | Status tag | ✅ Done |
| §3.1 Batch Cards | Manage button | ✅ Done |
| §3.1 Batch Cards | End button | ❌ Missing (M3) |
| §3.2 Batch Filtering | Ongoing / Completed / Upcoming tabs | ✅ Done |
| §3.3 Attendance | Mark attendance per session | ✅ Done |
| §3.3 Attendance | Mandatory remarks | ✅ Done |
| §3.3 Attendance | View attendance history | ✅ Done |
| §3.3 Attendance | Edit (same day, 10-min lock) | ✅ Done |
| §3.3 Attendance | Export to CSV | ✅ Done |
| §3.3 Attendance | Calendar view per student | ✅ Done |
| §3.3 Attendance | Present / Absent / Late classification | ✅ Done |
| §3.3 Attendance | Module-wise breakdown | ❌ Missing (M2) |
| §3.3 Attendance | Date-wise remarks in student view | ❌ Missing (M1) |
| §3.3 Attendance | Sync with Student Management | ✅ Done |
| §3.3 Attendance | Sync with analytics / OGI | ✅ Done |
| §4.1 Assignments | Create under a lesson | ✅ Done (`lessonName`, `lessonId` fields) |
| §4.1 Assignments | Edit assignments | ✅ Done |
| §4.1 Assignments | Set deadline | ✅ Done |
| §4.1 Assignments | Attach instructions | ✅ Done |
| §4.1 Assignments | Submission type (PDF, JPG, etc.) | ✅ Done |
| §4.1 Assignments | View submissions | ✅ Done |
| §4.1 Assignments | Download submitted files | ❌ Missing (H5) |
| §4.1 Assignments | Detect late submissions | ✅ Done |
| §4.1 Assignments | Enter marks + feedback | ✅ Done |
| §4.1 Assignments | Mark as Evaluated | ✅ Done |
| §4.1 Assignments | Status: Not Submitted | ✅ Done |
| §4.1 Assignments | Status: Submitted | ✅ Done |
| §4.1 Assignments | Status: Late Submitted | ✅ Done |
| §4.1 Assignments | Status: Evaluated | ✅ Done |
| §4.2 Quizzes | Create under a lesson | ✅ Done |
| §4.2 Quizzes | Set duration | ✅ Done |
| §4.2 Quizzes | Add MCQ questions | ✅ Done |
| §4.2 Quizzes | Add explanations | ✅ Done |
| §4.2 Quizzes | Set attempt limits | ✅ Done |
| §4.2 Quizzes | View attempts (GET endpoint) | ✅ Done |
| §4.2 Quizzes | View scores | ✅ Done |
| §4.2 Quizzes | View class average | ✅ Done |
| §4.2 Quizzes | Restrict attempts | ✅ Done |
| §5 Students | Search by Name / ID / Email / Course | ✅ Done |
| §5 Students | Filter by course | ✅ Done |
| §5 Students | Summary cards (Total, Ongoing, Completed) | ✅ Done |
| §5 Students | Avatar in table | ✅ Done |
| §5 Students | GitHub & LinkedIn in table | ❌ Missing (H2) |
| §5 Students | Attendance color coding | ✅ Done |
| §5 Modal | Student name, Enrollment ID, Status badge | ✅ Done |
| §5 Modal | Course in header | ✅ Done |
| §5 Modal | Attendance badge in header | ✅ Done |
| §5 Modal | Course Information tab | ✅ Done |
| §5 Modal | Weekly Activity chart (Course Info) | ❌ Missing (M11) |
| §5 Modal | Progress tab | ✅ Done |
| §5 Modal | Attendance tab with calendar | ✅ Done |
| §5 Modal | Module-wise attendance stats | ❌ Missing (M2) |
| §5 Modal | Date-wise remarks in attendance | ❌ Missing (M1) |
| §6 Support | Course filter | ✅ Done |
| §6 Support | Status filter | ✅ Done |
| §6 Support | View doubts / filter (real data) | ✅ Done |
| §6 Support | Reply to doubts | ✅ Done |
| §6 Support | Upload solution files | ✅ Done |
| §6 Support | Mark as resolved | ✅ Done |
| §6 Support | Attachment preview (Teacher) | ✅ Done |
| §6 Support | Attachment preview (Admin) | ❌ Missing (H4) |
| §6 Support | Approve / schedule backup classes | ⚠️ Partial (H4 - needs testing) |
| §7.1 Class Analytics | Avg Quiz Score | ✅ Done |
| §7.1 Class Analytics | Avg Assignment Score | ✅ Done |
| §7.1 Class Analytics | Submission Consistency | ✅ Done |
| §7.1 Class Analytics | Module Completion Rate | ✅ Done |
| §7.1 Class Analytics | Overall Class OGI | ✅ Done |
| §7.1 Class Analytics | Module-wise Attendance Comparison | ❌ Missing (M12) |
| §7.1 Class Analytics | Weekly Activity Trend | ✅ Done |
| §7.1 Class Analytics | Attendance Heatmap | ✅ Done |
| §7.2 Student Monitoring | OGI trend over time | ✅ Done |
| §7.2 Student Monitoring | Growth classification | ✅ Done |
| §7.2 Student Monitoring | Module completion progress | ✅ Done |
| §7.2 Student Monitoring | Learning streak | ✅ Done |
| §7.2 Student Monitoring | Skill acquisition count | ✅ Done |
| §7.2 Student Monitoring | Download student report | ❌ Missing (M6) |
| §7.3 Weekly Snapshots | Weekly aggregated data stored | ✅ Done |
| §7.3 Weekly Snapshots | Week-to-week delta comparison | ❌ Missing (H6) |
| §7.3 Weekly Snapshots | Improvement trend detection | ❌ Missing (H6) |
| §7.3 Weekly Snapshots | Stagnation detection | ❌ Missing (L6) |
| §7.4 Leaderboard | View class leaderboard | ✅ Done |
| §7.4 Leaderboard | Filter by batch | ✅ Done |
| §7.4 Leaderboard | Filter by course | ✅ Done |
| §7.4 Leaderboard | Sort by OGI / Attendance / Assignment | ✅ Done |
| §7.4 Leaderboard | Auto-update on changes | ❌ Missing (M10) |

---

_Last verified against live codebase — February 2026_
_Total PRD items: ~80 | Implemented: ~57 | Partial: ~2 | Missing: ~21_
