<div align="center">

# नवकल्पना (NavKalpana)

### 🎓 Classroom Intelligence & Resource Management Platform

*Reimagining how institutions manage classrooms, track growth, and empower educators*

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)

</div>

---

## 📖 Problem Statement

Traditional educational institutions depend on fragmented, manual processes for attendance, assessments, and student tracking. **NavKalpana** solves this by providing a unified, real-time platform with:

- **Automated Attendance** with edit-lock safeguards and CSV export
- **Assessment Lifecycle Management** — creation, submission tracking, late detection, and in-app grading
- **Student Growth Index (OGI)** — a composite metric (40% Attendance + 60% Academics)
- **Doubt Resolution System** with priority escalation and backup class scheduling
- **Role-based Dashboards** for Admins, Teachers, and Students

> See [`docs/problem-statement.md`](docs/problem-statement.md) for the detailed problem statement.

---

## 👥 Team Members & Roles

| Name              | Role                          |
|-------------------|-------------------------------|
| Arunav Kishor     | Team Lead / Backend Developer |
| *(Add Member 2)*  | *(Role)*                      |
| *(Add Member 3)*  | *(Role)*                      |
| *(Add Member 4)*  | *(Role)*                      |

> **Team Name:** NavKalpana | **Project Code:** RICR-NK-0003

---

## 🛠️ Tech Stack

| Layer        | Technology                                              |
|-------------|----------------------------------------------------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts, Radix UI |
| **Backend**  | Node.js, Express 5, Mongoose 9 (MongoDB ODM)            |
| **Database** | MongoDB Atlas                                            |
| **Auth**     | JWT (JSON Web Tokens), bcryptjs                          |
| **Storage**  | Cloudinary (images & file uploads)                       |
| **Dev Tools**| Nodemon, ESLint, Morgan (HTTP logger)                    |

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
cd server
pnpm install
```

Create a `.env` file in the `server/` directory:

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
cd client
pnpm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:4500
```

Start the development server:

```bash
pnpm dev
```

### 4. Seed Admin User (Optional)

```bash
cd server
pnpm run seed:admin
```

---

## 📡 API Endpoints

> Full documentation available in [`docs/api-documentation.md`](docs/api-documentation.md)

### Quick Reference

| Module          | Base Path            | Key Endpoints                                          |
|-----------------|----------------------|--------------------------------------------------------|
| **Auth**        | `/api/auth`          | `POST /login`, `POST /register`, `GET /me`             |
| **Students**    | `/api/students`      | CRUD + `/me`, `/:id/progress`, `/:id/enroll`           |
| **Batches**     | `/api/batches`       | CRUD + `/:id/students`, `/:id/attendance`              |
| **Attendance**  | `/api/attendance`    | CRUD + `/export`, `/student/:id`, `/batch/:id`         |
| **Assessments** | `/api/assessments`   | CRUD + `/:id/submit`, `/:id/grade/:subId`              |
| **Support**     | `/api/support`       | CRUD + `/:id/respond`, `/:id/resolve`, `/statistics`   |
| **Dashboard**   | `/api/dashboard`     | `/stats`, `/performance`, `/deadlines`, `/trends`      |
| **Teachers**    | `/api/teachers`      | Full CRUD (Admin only)                                 |
| **Contact**     | `/api/contact`       | `POST /`, `GET /`, `DELETE /:id`                       |

---

## 📸 Screenshots

> Add screenshots of the application here.

| Screen                       | Preview                                     |
|------------------------------|---------------------------------------------|
| Admin Dashboard              | *Add screenshot*                            |
| Teacher — Batch Detail       | *Add screenshot*                            |
| Teacher — Assessment Grading | *Add screenshot*                            |
| Student Dashboard            | *Add screenshot*                            |
| Attendance Calendar          | *Add screenshot*                            |

---

## 📂 Project Structure

```
NavKalpana/
├── client/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level components
│   │   ├── config/           # API configuration
│   │   └── lib/              # Utilities
│   └── package.json
│
├── server/                   # Backend (Express + MongoDB)
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
│   ├── problem-statement.md
│   ├── architecture-diagram.png
│   ├── api-documentation.md
│   └── presentation.pptx
│
└── README.md
```

---

## 🔮 Future Improvements

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

**Built with ❤️ by Team NavKalpana**

</div>
