<div align="center">

# Mind Rise

### 🎓 Classroom Intelligence & Resource Management Platform

_Reimagining how institutions manage classrooms, track growth, and empower educators_

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)

</div>

---

## 📖 Problem Statement — Mind Rise

Traditional educational institutions depend on fragmented, manual processes for attendance, assessments, and student tracking. **Mind Rise** solves this by providing a unified, real-time platform with:

- **Automated Attendance** with Present / Absent / Late classification, edit-lock safeguards, and CSV export
- **Assessment Lifecycle Management** — assignments and quizzes with submission tracking, late detection, and in-app grading with feedback
- **Overall Growth Index (OGI)** — a composite metric: `(Attendance% × 0.4) + (Academics% × 0.6)` with 4-level growth classification
- **Weekly Performance Snapshots** stored historically for trend analysis and week-over-week comparison
- **Doubt Resolution System** with priority escalation, teacher replies, solution file upload, and backup class scheduling
- **Analytics & Leaderboard** — class-wide OGI trends, attendance heatmaps, and student rankings
- **Role-based Dashboards** for Admins and Teachers with real-time KPI cards

> See [`docs/problem-statement.md`](docs/problem-statement.md) for the detailed problem statement.
> See [`docs/remaining-tasks.md`](docs/remaining-tasks.md) for the PRD compliance checklist and feature gap tracking.

---

## 👥 Team Members & Roles

| Name           | Role                        |
| -------------- | --------------------------- |
| Arunav Kishor  | Team Lead / UI/UX Developer |
| Prateek Raiger | Full Stack Developer        |
| Punit          | Frontend Developer          |
| Pradeep        | Backend Developer           |

> **Team Name:** NavKalpana (Project: Mind Rise) | **Project Code:** RICR-NK-0003

---

## 🛠️ Tech Stack

| Layer         | Technology                                                          |
| ------------- | ------------------------------------------------------------------- |
| **Frontend**  | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts, Radix UI |
| **Backend**   | Node.js, Express 5, Mongoose 9 (MongoDB ODM)                        |
| **Database**  | MongoDB Atlas                                                       |
| **Auth**      | JWT (JSON Web Tokens), bcryptjs                                     |
| **Storage**   | Cloudinary (images & file uploads)                                  |
| **Dev Tools** | Nodemon, ESLint, Morgan (HTTP logger)                               |

---

## 🚀 Installation Steps

### Prerequisites

- Node.js v18 or higher
- pnpm (recommended) or npm
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account

### 1. Clone the Repository

```bash
git clone https://github.com/ArunavKishor/NavKalpana-RICR-NK-0003.git
cd NavKalpana-RICR-NK-0003
```

### 2. Setup Backend

```bash
cd backend
pnpm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=4500
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mindriseDB
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
pnpm dev
```

### 3. Setup Frontend

```bash
cd frontend
pnpm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:4500
```

Start the development server:

```bash
pnpm dev
```

### 4. Seed Admin User (Optional)

```bash
cd backend
pnpm run seed:admin
```

---

## 📡 API Endpoints

> Full documentation available in [`docs/api-documentation.md`](docs/api-documentation.md)

### Quick Reference

| Module          | Base Path          | Key Endpoints                                                                          |
| --------------- | ------------------ | -------------------------------------------------------------------------------------- |
| **Auth**        | `/api/auth`        | `POST /login`, `POST /logout`, `GET /me`                                               |
| **Students**    | `/api/students`    | CRUD + `/me`, `/:id/progress`, `/:id/enroll`                                           |
| **Batches**     | `/api/batches`     | CRUD + `/:id/students`, `/:id/attendance`                                              |
| **Attendance**  | `/api/attendance`  | CRUD + `/export`, `/student/:id`, `/batch/:id`                                         |
| **Assessments** | `/api/assessments` | CRUD + `/:id/submit`, `/:id/grade/:subId`, `/:id/questions`, `/:id/attempts`           |
| **Support**     | `/api/support`     | CRUD + `/:id/respond`, `/:id/resolve`, `/:id/schedule-backup-class`, `/statistics`     |
| **Dashboard**   | `/api/dashboard`   | `/teacher/stats`, `/teacher/analytics`, `/teacher/leaderboard`, `/teacher/performance` |
| **Teachers**    | `/api/teachers`    | Full CRUD (Admin only) + `/me`, `/:id/upload-photo`                                    |
| **Contact**     | `/api/contact`     | `POST /`, `GET /`, `DELETE /:id`                                                       |

---

## 📸 Screenshots

> Add screenshots of the application here.

| Screen                       | Preview          |
| ---------------------------- | ---------------- |
| Admin Dashboard              | _Add screenshot_ |
| Teacher — Batch Detail       | _Add screenshot_ |
| Teacher — Assessment Grading | _Add screenshot_ |
| Student Dashboard            | _Add screenshot_ |
| Attendance Calendar          | _Add screenshot_ |

---

## 📂 Project Structure (Mind Rise)

```
Mind-Rise/
├── frontend/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   ├── config/           # API configuration
│   │   └── lib/              # Utilities
│   └── package.json
│
├── backend/                  # Backend (Express + MongoDB)
│   ├── server.js             # Entry point
│   └── src/
│       ├── config/           # DB & Cloudinary config
│       ├── controllers/      # Route handlers
│       ├── middlewares/       # Auth & upload middleware
│       ├── models/           # Mongoose schemas
│       ├── routers/          # API route definitions
│       ├── seeders/          # Database seeders
│       └── utils/            # Helper utilities
│
├── docs/                     # Documentation
│   ├── problem-statement.md      # Problem statement & solution overview
│   ├── architecture-diagram.md   # System architecture, DB schema, routes
│   ├── api-documentation.md      # Complete API endpoint reference
│   └── remaining-tasks.md        # PRD compliance checklist & feature gap tracker
│
└── README.md
```

---

## 🔮 Future Improvements for Mind Rise

- **Real-time Notifications** — Push notifications for assessment deadlines and support responses using WebSockets
- **AI-powered Analytics** — Predictive analytics for identifying at-risk students using ML models
- **Video Conferencing Integration** — Built-in backup class sessions via WebRTC
- **Mobile App** — React Native companion app for students and teachers
- **Parent Portal** — Dashboard for parents to track child's academic progress
- **Automated Report Cards** — Generate and email PDF report cards at the end of each term
- **Multi-language Support** — Hindi and regional language support for wider accessibility
- **Gamification** — Leaderboards, badges, and streaks to boost student engagement

---

## 📄 License

This project is built for educational purposes as part of the RICR program.

---

<div align="center">

**Built with ❤️ by Team NavKalpana for Mind Rise**

</div>
