# MindRise

**Classroom Intelligence & Resource Management Platform**

MindRise is a full-stack web application built for educational institutions. It provides role-based dashboards for **Admins** and **Teachers** to manage batches, students, attendance, assessments, quizzes, support requests, and performance analytics — all from a single unified platform.

> Built as part of the **NavKalpana RICR-NK-0003** program by **Arunav Kishor and Team**.

---

## Table of Contents

- [Overview](#overview)
- [User Roles](#user-roles)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Authentication Flow](#authentication-flow)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running in Development](#running-in-development)
- [Building for Production](#building-for-production)
- [Seeding the Database](#seeding-the-database)
- [Deployment](#deployment)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

MindRise is designed to replace fragmented spreadsheet-based workflows in educational institutes. It centralises student data, attendance records, assignment submissions, quiz results, and support communication into one platform — accessible by admins and teachers with fully separate, role-scoped views.

The **OGI (Overall Growth Index)** is a core metric calculated per student that blends attendance percentage and academic scores into a single growth indicator, used across dashboards, leaderboards, and analytical reports.

---

## User Roles

MindRise has two active roles. Each role has a completely separate dashboard, sidebar, and scoped API access.

### Admin

The Admin has unrestricted access to the entire platform.

| Capability                | Details                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| **Dashboard Overview**    | Institution-wide KPIs — total students, teachers, active batches, pending assessments |
| **Batch Management**      | Create, edit, and delete batches; upload cover images; assign teachers                |
| **Student Management**    | Add, edit, delete students; enroll or unenroll from batches; view progress profiles   |
| **Teacher Management**    | Add, edit, and remove teacher accounts                                                |
| **Assessment Management** | Create assignments and quizzes; review all submissions; grade and evaluate work       |
| **Attendance Overview**   | View attendance records across all batches; export CSV reports                        |
| **Support Requests**      | View and respond to all support tickets raised by teachers                            |
| **Analytics**             | Platform-wide performance analytics, trend charts, and deadline tracking              |

### Teacher

The Teacher has access scoped exclusively to their assigned batches and the students within them.

| Capability                | Details                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Dashboard Overview**    | KPIs for their batches — active students, pending assignments, attendance summaries           |
| **Batch Management**      | View and manage their assigned batches                                                        |
| **Student Management**    | Monitor students within their batches; view individual student profiles                       |
| **Attendance Marking**    | Mark session attendance; session-based edit locks prevent retrospective tampering; export CSV |
| **Assessment Management** | Create assignments and quizzes for their batches; view and manually grade submissions         |
| **Quiz Management**       | Build quiz question banks; auto-grading support                                               |
| **Analytics**             | OGI-based class performance, weekly activity trends, module-wise attendance, leaderboard      |
| **Support**               | Create and track support tickets; communicate with admin                                      |
| **Account Settings**      | Update personal profile and credentials                                                       |

---

## Features

### Admin Dashboard

- Institution-wide stats: total students, teachers, active batches, pending assessments
- Class performance analytics with trend charts (scores vs. attendance)
- Upcoming assessment deadline tracking
- Full batch, student, and teacher CRUD management
- Assessment management — creation, submission review, grading, evaluation
- Support request handling and response

### Teacher Dashboard

- Batch and student management scoped to assigned batches
- Attendance marking with session-based edit locks and CSV export
- Assignment and quiz creation with auto-grading support
- Submission viewing, manual grading, and submission statistics
- Student performance analytics with OGI, growth classification, and leaderboard
- Support ticket creation and response tracking
- Account settings management

### Platform-wide

- JWT-based authentication with persistent login via `localStorage`
- Role-based route protection (Admin / Teacher) using React Router and `ProtectedRoute`
- Cloudinary integration for file uploads (batch cover images, assignment files, submissions)
- Skeleton loading states across all data-heavy pages
- Fully responsive layout with mobile sidebar navigation
- Toast notifications for all user actions
- CSV export on Students, Attendance, and Analytics pages

---

## Tech Stack

### Frontend

| Package              | Version | Purpose                         |
| -------------------- | ------- | ------------------------------- |
| React                | 19      | UI framework                    |
| Vite                 | 7       | Build tool and dev server       |
| React Router DOM     | 7       | Client-side routing             |
| Tailwind CSS         | 4       | Utility-first styling           |
| Shadcn UI + Radix UI | Latest  | Accessible component primitives |
| Framer Motion        | 12      | Animations and transitions      |
| Recharts             | 3       | Charts and data visualisation   |
| Axios                | 1.13    | HTTP client with interceptors   |
| React Hot Toast      | 2       | Toast notification system       |
| Lucide React         | Latest  | Icon library                    |
| date-fns             | 4       | Date formatting utilities       |

### Backend

| Package        | Version | Purpose                                |
| -------------- | ------- | -------------------------------------- |
| Node.js        | 18+     | Runtime                                |
| Express        | 5       | HTTP framework                         |
| Mongoose       | 9       | MongoDB ODM                            |
| JSON Web Token | 9       | Auth token generation and verification |
| bcryptjs       | 3       | Password hashing                       |
| Multer         | 2       | File upload handling                   |
| Cloudinary SDK | 1.41    | Cloud file storage                     |
| Morgan         | 1.10    | HTTP request logging                   |
| cookie-parser  | 1.4     | Cookie middleware                      |
| dotenv         | 17      | Environment variable loading           |
| nodemon        | 3       | Dev server auto-restart                |

### Infrastructure

| Service       | Purpose                |
| ------------- | ---------------------- |
| MongoDB Atlas | Cloud database         |
| Cloudinary    | File and image storage |
| Vercel        | Frontend deployment    |

---

## Project Structure

```
NavKalpana-RICR-NK-0003/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── cloudinary.js        # Cloudinary setup
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── analyticsController.js
│       │   ├── assessmentController.js
│       │   ├── attendanceController.js
│       │   ├── batchController.js
│       │   ├── dashboardController.js
│       │   ├── studentController.js
│       │   ├── supportController.js
│       │   └── teacherController.js
│       ├── middlewares/
│       │   ├── authMiddleware.js    # JWT verification + role guard
│       │   └── uploadMiddleware.js  # Multer + Cloudinary config
│       ├── middleware/
│       │   └── rateLimit.js
│       ├── models/
│       │   ├── userModel.js
│       │   ├── studentModel.js
│       │   ├── teacherModel.js
│       │   ├── batchModel.js
│       │   ├── assessmentModel.js
│       │   ├── attendanceModel.js
│       │   ├── submissionModel.js
│       │   ├── quizQuestionModel.js
│       │   ├── quizAttemptModel.js
│       │   ├── supportRequestModel.js
│       │   └── weeklySnapshotModel.js
│       ├── routers/
│       │   ├── authRouter.js
│       │   ├── assessmentRoutes.js
│       │   ├── attendanceRoutes.js
│       │   ├── batchRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── studentRoutes.js
│       │   ├── supportRoutes.js
│       │   └── teacherRoutes.js
│       ├── seeders/
│       │   ├── seedAdmin.js
│       │   ├── seedStudent.js
│       │   └── seedCourses.js
│       └── utils/
│           ├── errors.js
│           └── pagination.js
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                  # SPA fallback routing for Vercel
│   ├── env.example
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # Root router with lazy-loaded routes
│       ├── main.jsx
│       ├── index.css
│       ├── config/
│       │   └── Api.jsx              # Axios instance + auth interceptors
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state (localStorage)
│       ├── lib/
│       │   └── utils.js
│       ├── components/
│       │   ├── ProtectedRoute.jsx   # Role-based route guard
│       │   ├── admin/
│       │   │   ├── AdminBatchForm.jsx
│       │   │   ├── AdminStudentForm.jsx
│       │   │   ├── AdminTeacherForm.jsx
│       │   │   ├── AdminStudentDetailModal.jsx
│       │   │   ├── AdminSupportForm.jsx
│       │   │   ├── AdminModal.jsx
│       │   │   └── AdminDeleteConfirmationDialog.jsx
│       │   ├── common/
│       │   │   ├── PageLoader.jsx
│       │   │   └── ImageUploadComponent.jsx
│       │   ├── dashboard/
│       │   │   ├── DashboardMainLayout.jsx
│       │   │   ├── DashboardHeader.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── TeacherDashboardHeader.jsx
│       │   ├── teacher/
│       │   │   ├── TeacherDashboardSidebar.jsx
│       │   │   ├── AttendanceModal.jsx
│       │   │   └── StudentDetailModal.jsx
│       │   └── ui/                  # Shadcn UI primitives
│       └── pages/
│           ├── Login.jsx
│           ├── dashboards/admin/    # All admin pages
│           └── teacher/
│               ├── TeacherDashboardHome.jsx
│               ├── TeacherDashboardLayout.jsx
│               ├── TeacherStudentManagement.jsx
│               ├── TeacherBatchManagement.jsx
│               ├── TeacherBatchDetail.jsx
│               ├── TeacherAssessmentManagement.jsx
│               ├── QuizManagement.jsx
│               ├── TeacherAnalytics.jsx
│               ├── TeacherSupport.jsx
│               └── TeacherAccount.jsx
│
├── docs/
│   ├── api-documentation.md
│   └── architecture-diagram.md
└── README.md
```

---

## Data Models

| Model            | Description                                                                             |
| ---------------- | --------------------------------------------------------------------------------------- |
| `User`           | Core auth record — email, hashed password, role (`admin` / `teacher`)                   |
| `Student`        | Student profile linked to a User; stores personal info, enrollment ID, GitHub, LinkedIn |
| `Teacher`        | Teacher profile linked to a User; stores department and assigned batches                |
| `Batch`          | A class group with name, course, cover image, instructor, and enrolled students         |
| `Assessment`     | Assignment or quiz attached to a batch; includes due date, type, file attachment        |
| `Submission`     | A student's submission for an Assessment; stores file URL, grade, and feedback          |
| `QuizQuestion`   | Question bank entry for a quiz; supports MCQ with correct answer and options            |
| `QuizAttempt`    | Records a student's answers and score for a quiz attempt                                |
| `Attendance`     | Session-based attendance record per batch; stores per-student present/absent status     |
| `SupportRequest` | A ticket with title, description, status, and reply thread                              |
| `WeeklySnapshot` | Weekly aggregated OGI and performance metrics per student for trend charts              |

---

## Authentication Flow

1. User submits email + password to `POST /api/auth/login`
2. Server validates credentials, signs a JWT, and returns it in the response body
3. Frontend stores the token and user object in `localStorage` via `AuthContext.login()`
4. All subsequent API requests attach the token via the Axios request interceptor as `Authorization: Bearer <token>`
5. On 401 responses, the interceptor clears `localStorage` and redirects to `/`
6. Logout calls `POST /api/auth/logout`, then clears local state and redirects to `/`

> Tokens persist across browser tabs and page refreshes because `localStorage` is used (unlike `sessionStorage` which is tab-isolated).

The `ProtectedRoute` component reads `isLogin` and `user.role` from `AuthContext`. If unauthenticated, it redirects to `/`. If authenticated but accessing a route outside their role, users are redirected to their own dashboard.

---

## API Overview

Base URL: `http://localhost:4500/api`

All protected routes require `Authorization: Bearer <token>` in the request header.

### Authentication — `/api/auth`

| Method | Endpoint    | Access        | Description                |
| ------ | ----------- | ------------- | -------------------------- |
| `POST` | `/register` | Public        | Register a new user        |
| `POST` | `/login`    | Public        | Login and receive JWT      |
| `POST` | `/logout`   | Authenticated | Logout and clear session   |
| `GET`  | `/me`       | Authenticated | Get current logged-in user |

### Students — `/api/students`

| Method   | Endpoint          | Description                                      |
| -------- | ----------------- | ------------------------------------------------ |
| `GET`    | `/`               | List all students (filterable by status, search) |
| `POST`   | `/`               | Create a new student                             |
| `GET`    | `/:id`            | Get student by ID                                |
| `PUT`    | `/:id`            | Update student                                   |
| `DELETE` | `/:id`            | Delete student                                   |
| `GET`    | `/:id/progress`   | Get student progress metrics                     |
| `GET`    | `/:id/batches`    | Get student's enrolled batches                   |
| `GET`    | `/:id/attendance` | Get student attendance summary                   |
| `POST`   | `/:id/enroll`     | Enroll student in a batch                        |
| `POST`   | `/:id/unenroll`   | Unenroll student from a batch                    |

### Batches — `/api/batches`

| Method   | Endpoint            | Description                                    |
| -------- | ------------------- | ---------------------------------------------- |
| `GET`    | `/`                 | List batches (teachers see only their batches) |
| `POST`   | `/`                 | Create a new batch (with optional cover image) |
| `GET`    | `/:id`              | Get batch by ID                                |
| `PUT`    | `/:id`              | Update batch                                   |
| `DELETE` | `/:id`              | Delete batch                                   |
| `GET`    | `/:id/students`     | List students in a batch                       |
| `GET`    | `/:id/attendance`   | Get attendance records for a batch             |
| `POST`   | `/:id/upload-cover` | Upload batch cover image to Cloudinary         |

### Attendance — `/api/attendance`

| Method | Endpoint              | Access        | Description                    |
| ------ | --------------------- | ------------- | ------------------------------ |
| `GET`  | `/`                   | Admin/Teacher | List attendance records        |
| `POST` | `/`                   | Admin/Teacher | Mark session attendance        |
| `GET`  | `/export`             | Admin/Teacher | Export attendance as CSV       |
| `GET`  | `/:id`                | Admin/Teacher | Get attendance record by ID    |
| `PUT`  | `/:id`                | Admin/Teacher | Update attendance record       |
| `GET`  | `/student/:studentId` | Admin/Teacher | Attendance stats for a student |
| `GET`  | `/batch/:batchId`     | Admin/Teacher | Attendance stats for a batch   |

### Assessments — `/api/assessments`

| Method   | Endpoint                                  | Access        | Description                    |
| -------- | ----------------------------------------- | ------------- | ------------------------------ |
| `GET`    | `/`                                       | Admin/Teacher | List assessments               |
| `POST`   | `/`                                       | Admin/Teacher | Create assessment              |
| `GET`    | `/:id`                                    | Admin/Teacher | Get assessment                 |
| `PUT`    | `/:id`                                    | Admin/Teacher | Update assessment              |
| `DELETE` | `/:id`                                    | Admin/Teacher | Delete assessment              |
| `GET`    | `/:id/submissions`                        | Admin/Teacher | View all submissions           |
| `POST`   | `/:id/submit`                             | Admin/Teacher | Submit a file                  |
| `PUT`    | `/:id/grade/:submissionId`                | Admin/Teacher | Grade a submission             |
| `POST`   | `/:id/submissions/:submissionId/evaluate` | Admin/Teacher | Auto-evaluate submission       |
| `GET`    | `/:id/statistics`                         | Admin/Teacher | Assessment statistics          |
| `GET`    | `/:id/questions`                          | Admin/Teacher | Get quiz questions             |
| `POST`   | `/:id/questions`                          | Admin/Teacher | Create / upsert quiz questions |

### Dashboard — `/api/dashboard`

| Endpoint                   | Access        | Description                     |
| -------------------------- | ------------- | ------------------------------- |
| `GET /admin/stats`         | Admin         | Platform KPIs                   |
| `GET /teacher/stats`       | Teacher       | Teacher-scoped KPIs             |
| `GET /teacher/analytics`   | Teacher       | Full analytics payload          |
| `GET /teacher/leaderboard` | Teacher       | OGI-sorted leaderboard          |
| `GET /teacher/performance` | Teacher       | Weekly average performance data |
| `GET /deadlines`           | Admin/Teacher | Upcoming assessment deadlines   |

### Teachers — `/api/teachers`

| Method   | Endpoint | Description              |
| -------- | -------- | ------------------------ |
| `GET`    | `/`      | List all teachers        |
| `POST`   | `/`      | Create a teacher account |
| `GET`    | `/:id`   | Get teacher by ID        |
| `PUT`    | `/:id`   | Update teacher           |
| `DELETE` | `/:id`   | Delete teacher           |

### Support — `/api/support`

| Method   | Endpoint | Access        | Description               |
| -------- | -------- | ------------- | ------------------------- |
| `GET`    | `/`      | Admin/Teacher | List support requests     |
| `POST`   | `/`      | Teacher       | Create a support request  |
| `GET`    | `/:id`   | Admin/Teacher | Get request by ID         |
| `PUT`    | `/:id`   | Admin/Teacher | Update / reply to request |
| `DELETE` | `/:id`   | Admin         | Delete request            |

---

## Environment Variables

Create `.env` files in both `backend/` and `frontend/`. Reference the `env.example` files in each folder.

### `backend/.env`

```env
PORT=4500
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4500
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm** (pnpm recommended — lockfiles are pnpm-based)
- A **MongoDB Atlas** cluster (or local MongoDB instance)
- A **Cloudinary** account for file upload support

---

## Installation

```bash
# Clone the repo
git clone https://github.com/your-org/NavKalpana-RICR-NK-0003.git
cd NavKalpana-RICR-NK-0003

# Install backend dependencies
cd backend
npm install        # or: pnpm install

# Install frontend dependencies
cd ../frontend
npm install        # or: pnpm install
```

---

## Running in Development

Start both servers in separate terminals.

```bash
# Terminal 1 — Backend API server (port 4500)
cd backend
npm run dev

# Terminal 2 — Frontend dev server (port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.  
The frontend is configured to send all API calls to `VITE_API_URL` (defaults to `http://localhost:4500`).

---

## Building for Production

```bash
# Build the frontend
cd frontend
npm run build

# Preview the production build locally
npm run preview
```

The `vercel.json` in the frontend folder ensures all routes fall back to `index.html` so React Router works correctly on direct navigation and page refresh.

---

## Seeding the Database

Run seed scripts to populate initial data for development and testing.

```bash
cd backend

# 1. Create the default admin user
npm run seed:admin

# 2. Populate sample student records
npm run seed:students
```

> Always run `seed:admin` first — student and teacher seeds depend on the admin user existing.

After seeding, log in with the admin credentials printed in the terminal to access the admin dashboard.

---

## Deployment

### Frontend (Vercel)

1. Push the `frontend/` folder to a GitHub repository
2. Import the repo in [Vercel](https://vercel.com)
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`
4. Add `VITE_API_URL` as an environment variable pointing to your deployed backend
5. The `vercel.json` handles SPA routing automatically

### Backend

Deploy to any Node.js host (Railway, Render, Fly.io, etc.).

1. Set all environment variables from `backend/env.example`
2. Set the start command to `node server.js`
3. Update `CLIENT_URL` to your deployed frontend URL (for CORS)

---

## Team

MindRise is built and maintained by the **NavKalpana RICR-NK-0003** team.

| Name              | Role                 | Responsibilities                                               |
| ----------------- | -------------------- | -------------------------------------------------------------- |
| **Arunav Kishor** | UI/UX Developer      | User interface design, component architecture, user experience |
| **Pratik**        | Full Stack @Developer | Frontend + backend features, API integration, database design  |
| **Pradeep**       | Tester               | Quality assurance, bug reporting, testing workflows            |
| **Punit**         | Frontend Developer   | React components, page implementation, responsive design       |

---

## Contributing

This project is built by **Arunav Kishor** and the **NavKalpana RICR-NK-0003** team.

**Branching convention:**

```
main         — stable production code
dev          — active development branch
feature/*    — individual feature branches
fix/*        — bug fix branches
```

**Before submitting a PR:**

1. Ensure no lint errors — run `npm run lint` in `frontend/`
2. Test both Admin and Teacher flows manually
3. Keep commits focused and descriptive

---

## License

Built for educational purposes as part of the **NavKalpana RICR** program by **Arunav Kishor and Team**.  
Not licensed for commercial use. All rights reserved.
