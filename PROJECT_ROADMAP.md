# MindRise - Academic Operations & Management Portal

## Project Roadmap & Task Tracker (Teacher Module)

---

## COMPLETED TASKS

### 1. Authentication Module

| Feature                                           | Status                              |
| ------------------------------------------------- | ----------------------------------- |
| Email & Password login (Admin/Teacher + Student)  | ✅ Done                             |
| Role-based access control (admin/teacher/student) | ✅ Done                             |
| Password hashing (bcrypt)                         | ✅ Done                             |
| JWT-based session management (24h)                | ✅ Done                             |
| Logout functionality                              | ✅ Done                             |
| OTP generation & password reset routes            | ⚠️ Partial (OTP not stored/emailed) |

### 2. Admin Dashboard

| Feature                                                                 | Status  |
| ----------------------------------------------------------------------- | ------- |
| KPI Summary Cards (Total Students, Active Batches, Pending Assessments) | ✅ Done |
| Dynamic update from DB                                                  | ✅ Done |
| Upcoming Deadlines (next 7 days)                                        | ✅ Done |
| Weekly Activity Chart (Recharts)                                        | ✅ Done |
| Average Class Performance                                               | ✅ Done |
| Quick Navigation Buttons                                                | ✅ Done |

### 3. Batch Management (Admin)

| Feature                                                | Status  |
| ------------------------------------------------------ | ------- |
| Card-based layout with batch info                      | ✅ Done |
| Batch Name, Type, Students, Progress, Status Tag       | ✅ Done |
| Visual progress bar                                    | ✅ Done |
| Filter tabs (Ongoing/Completed/Upcoming)               | ✅ Done |
| Create/Edit/Delete batch (Full CRUD)                   | ✅ Done |
| Batch detail page (content, students, attendance tabs) | ✅ Done |
| Mark attendance per session                            | ✅ Done |
| View attendance history                                | ✅ Done |
| Present/Absent/Late classification                     | ✅ Done |

### 4. Assessment Management (Admin)

| Feature                         | Status  |
| ------------------------------- | ------- |
| Assignment & Quiz tabs          | ✅ Done |
| List/filter assessments         | ✅ Done |
| Delete assessments              | ✅ Done |
| View submissions API (backend)  | ✅ Done |
| Grade submissions API (backend) | ✅ Done |
| Submit assessment API (backend) | ✅ Done |

### 5. Student Management (Admin)

| Feature                                                                     | Status  |
| --------------------------------------------------------------------------- | ------- |
| Student list with search                                                    | ✅ Done |
| Filter by status (active/completed)                                         | ✅ Done |
| Summary cards (Total/Active/Completed)                                      | ✅ Done |
| Student table (avatar, name, enrollment, course, attendance%, email, phone) | ✅ Done |
| Attendance color coding (Green/Yellow/Red)                                  | ✅ Done |
| Create/Edit/Delete student (Full CRUD)                                      | ✅ Done |
| Enroll/Unenroll student in batch (backend)                                  | ✅ Done |
| Student detail modal                                                        | ✅ Done |

### 6. Teacher Management (Admin)

| Feature                         | Status  |
| ------------------------------- | ------- |
| Full CRUD for teachers          | ✅ Done |
| Teacher list with search/filter | ✅ Done |

### 7. Support Requests (Admin)

| Feature                                   | Status  |
| ----------------------------------------- | ------- |
| Full CRUD for support requests            | ✅ Done |
| Status filter (Open/In-Progress/Resolved) | ✅ Done |
| Priority filter                           | ✅ Done |
| Respond to support requests (backend)     | ✅ Done |

### 8. Server Infrastructure

| Feature                               | Status  |
| ------------------------------------- | ------- |
| All REST API routes                   | ✅ Done |
| Pagination utility                    | ✅ Done |
| Error handling utility                | ✅ Done |
| Cloudinary integration                | ✅ Done |
| Database seeders (admin + students)   | ✅ Done |
| Auth middleware (protect + authorize) | ✅ Done |

---

## PENDING TASKS

### 🔴 P0 — CRITICAL (Blocking core functionality)

| #   | Task                                                 | Details                                                                                                                                                                                                                                              | Files Affected                                                                    |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **Fix Assessment Create/Edit (Admin)**               | `onSubmit` prop is NOT passed to `<AssessmentForm>` — creating/editing assessments does nothing. Wire up `api.post`/`api.put` calls.                                                                                                                 | `client/src/pages/dashboards/admin/AdminAssessment.jsx`                           |
| 2   | **Fix Submission List Modal (Admin)**                | `submissionModalOpen` state exists but no button opens it — teachers can't view student submissions. Add "View Submissions" button on each assessment card.                                                                                          | `client/src/pages/dashboards/admin/AdminAssessment.jsx`                           |
| 3   | **Wire Teacher Dashboard to API**                    | `TeacherDashboardHome.jsx` is 100% hardcoded — all stats show "0", chart data is fake, low-performing students list is static. Connect to `/api/dashboard/stats`, `/api/dashboard/performance`, `/api/dashboard/deadlines`, `/api/dashboard/trends`. | `client/src/pages/teacher/TeacherDashboardHome.jsx`                               |
| 4   | **Add Batch Management to Teacher sidebar & routes** | PRD requires teacher to manage batches + attendance, but no batch route exists under `/teacher-dashboard`. Teacher sidebar is missing "Batch Management".                                                                                            | `client/src/components/teacher/TeacherDashboardSidebar.jsx`, `client/src/App.jsx` |
| 5   | **Add Support Requests to Teacher sidebar**          | PRD requires teachers to view/respond to support requests, but sidebar is missing the link (route exists but no nav item).                                                                                                                           | `client/src/components/teacher/TeacherDashboardSidebar.jsx`                       |

### 🟠 P1 — HIGH (Core PRD requirements not yet built)

| #   | Task                                                   | Details                                                                                                                                                                        | Files Affected                                                                                                        |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 6   | **Build Quiz Backend API**                             | Quizzes are stored in localStorage only. Need backend model with: questions array, MCQ options, correct answers, duration, attempt limits, explanations. Need CRUD API routes. | New: `server/src/models/quizModel.js`, `server/src/controllers/quizController.js`, `server/src/routers/quizRoutes.js` |
| 7   | **Migrate Quiz Management to Backend**                 | Teacher `QuizManagement.jsx` uses `quizService` (localStorage). Refactor to use the new quiz API.                                                                              | `client/src/pages/teacher/QuizManagement.jsx`, `client/src/components/teacher/CreateQuiz.jsx`                         |
| 8   | **Migrate Student Quizzes to Backend**                 | `Quizzes.jsx` and `QuizQuestions.jsx` use localStorage. Refactor to fetch from backend API and save results.                                                                   | `client/src/pages/student/Quizzes.jsx`, `client/src/pages/student/QuizQuestions.jsx`                                  |
| 9   | **Wire Student Assignment Page to API**                | `AssignmentManagement.jsx` has 3 hardcoded static assignments. Must fetch from `/api/assessments` and submit via `/api/assessments/:id/submit`.                                | `client/src/pages/student/AssignmentManagement.jsx`                                                                   |
| 10  | **Wire Student Attendance Page to API**                | `AttendanceSummary.jsx` is 100% hardcoded. Need new endpoint `/api/students/me/attendance` and wire it up.                                                                     | `client/src/pages/student/AttendanceSummary.jsx`, new server route                                                    |
| 11  | **Wire Student Profile Page to API**                   | `StudentProfile.jsx` is 100% hardcoded. Need GET/PUT endpoints for student profile.                                                                                            | `client/src/pages/student/StudentProfile.jsx`, new server route                                                       |
| 12  | **Add Attendance Edit Time-Lock (10 min)**             | PRD requires: "Edit attendance records (Same Date Only & Active till 10 mins after Submission)". Not implemented.                                                              | `server/src/controllers/attendanceController.js`                                                                      |
| 13  | **Add Mandatory Remarks before Attendance Submission** | PRD requires: "Add Remarks before Submission (Mandatory)". Currently remarks are optional.                                                                                     | `client/src/pages/dashboards/admin/AdminAttendance.jsx`, `client/src/pages/dashboards/admin/BatchDetail.jsx`          |

### 🟡 P2 — MEDIUM (PRD features for polish & completeness)

| #   | Task                                       | Details                                                                                                                                              | Files Affected                                                |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 14  | **Student Detail Modal - Progress Tab**    | Progress tab needs module-wise completion, assignment/quiz summary, overall progress %. Currently shows only attendance-based data.                  | `client/src/components/admin/AdminStudentDetailModal.jsx`     |
| 15  | **Student Detail Modal - Attendance Tab**  | Need calendar view, module-wise stats, date-wise remarks as per PRD.                                                                                 | `client/src/components/admin/AdminStudentDetailModal.jsx`     |
| 16  | **Attendance Calendar View**               | PRD requires a calendar view per student. Not implemented anywhere.                                                                                  | New component                                                 |
| 17  | **Attendance Export**                      | PRD requires export attendance records. "Export" button exists but is non-functional.                                                                | `client/src/pages/dashboards/admin/AdminAttendance.jsx`       |
| 18  | **Batch End Button**                       | PRD requires an "End Button" on batch cards. Not implemented.                                                                                        | `client/src/pages/dashboards/admin/AdminBatches.jsx`          |
| 19  | **Assessment File Upload for Submissions** | PRD requires "Define submission type (Image, PDF, JPG etc)". `submissionModel` has no file field; Cloudinary is set up but not wired to submissions. | `server/src/models/submissionModel.js`, assessment controller |
| 20  | **Late Submission Detection**              | PRD requires detecting & flagging late submissions. Backend blocks late submissions instead of flagging them.                                        | `server/src/controllers/assessmentController.js`              |
| 21  | **Quiz Timer/Duration Enforcement**        | PRD requires quiz duration enforcement. No timer implemented in `QuizQuestions.jsx`.                                                                 | Quiz components                                               |
| 22  | **Quiz Attempt Limits**                    | PRD requires restricting quiz attempts. Not implemented.                                                                                             | Quiz backend + frontend                                       |
| 23  | **Support - File Attachment Preview**      | PRD requires attachment preview on support requests. No file field in support model.                                                                 | `server/src/models/supportRequestModel.js`                    |
| 24  | **Support - Reply with Solution Files**    | PRD requires teachers to upload solution files. Not implemented.                                                                                     | Support controller + frontend                                 |

### 🟢 P3 — LOW (Nice-to-have / Polish)

| #   | Task                                         | Details                                                                   | Files Affected                                             |
| --- | -------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 25  | **Header Search Functionality**              | Search bar in top header is non-functional.                               | `client/src/components/dashboard/DashboardTopHeader.jsx`   |
| 26  | **Notification System**                      | Bell icon exists with red dot but does nothing.                           | `client/src/components/dashboard/DashboardTopHeader.jsx`   |
| 27  | **Profile Dropdown - Settings/Profile**      | Dropdown only has "Log Out". PRD wants Profile section.                   | `client/src/components/dashboard/DashboardTopHeader.jsx`   |
| 28  | **Mobile Responsive Sidebar**                | No overlay/drawer behavior on mobile for both admin and teacher layouts.  | Layout components                                          |
| 29  | **Token Refresh & Validation on Hydration**  | Expired tokens aren't detected on page load — stale sessions possible.    | `client/src/context/AuthContext.jsx`                       |
| 30  | **Dashboard Time-Range Filter**              | "Last 6 Weeks" dropdown exists but is non-functional.                     | `client/src/pages/dashboards/admin/AdminDashboardHome.jsx` |
| 31  | **Low-Performing Student Alerts**            | PRD optional feature. Hardcoded in teacher dashboard, missing from admin. | Dashboard pages                                            |
| 32  | **Weekly Activity Chart on Student Profile** | PRD requires this under Course Information tab. Not built.                | Student detail modal                                       |
| 33  | **Skills Acquired / Learning Streak**        | PRD mentions these in Student Detail → Course Info tab. Not built.        | Student detail modal                                       |

---

## RECOMMENDED EXECUTION ORDER

### Phase 1 (Week 1) — Fix Broken Admin Features

- [ ] #1 Fix Assessment Create/Edit
- [ ] #2 Fix Submission List Button
- [ ] #5 Add Support Requests to Teacher sidebar
- [ ] #4 Add Batch Management to Teacher routes/sidebar
- [ ] #13 Make attendance remarks mandatory

### Phase 2 (Week 2) — Wire Teacher Dashboard

- [ ] #3 Connect TeacherDashboardHome to API
- [ ] #12 Attendance edit time-lock (10 min)

### Phase 3 (Week 2–3) — Build Quiz Backend

- [ ] #6 Create Quiz model + API
- [ ] #7 Migrate teacher QuizManagement to backend
- [ ] #8 Migrate student Quizzes + QuizQuestions to backend
- [ ] #21 Timer enforcement
- [ ] #22 Attempt limits

### Phase 4 (Week 3–4) — Student Portal

- [ ] #9 Wire Student Assignments to API
- [ ] #10 Wire Student Attendance to API
- [ ] #11 Wire Student Profile to API

### Phase 5 (Week 4–5) — Advanced Features

- [ ] #14–16 Student Detail Modal enhancements
- [ ] #17 Attendance export
- [ ] #18 Batch end button
- [ ] #19–20 File uploads + late submission flagging
- [ ] #23–24 Support attachments

### Phase 6 (Ongoing) — Polish

- [ ] #25–33 Search, notifications, mobile responsiveness, etc.

---

## Tech Stack

| Layer        | Technology                                                |
| ------------ | --------------------------------------------------------- |
| Frontend     | React + Vite, TailwindCSS, Framer Motion, Recharts, Axios |
| Backend      | Express.js (v5), Mongoose (v9), JWT, bcryptjs             |
| Database     | MongoDB Atlas                                             |
| File Storage | Cloudinary                                                |
| Auth         | JWT (cookie + Bearer header), bcrypt hashing              |

---

_Last Updated: February 23, 2026_
