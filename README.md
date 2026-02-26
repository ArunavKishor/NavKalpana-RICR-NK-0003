# MindRise

**Classroom Intelligence & Resource Management Platform**

MindRise is a full-stack web application for educational institutions. It provides role-based dashboards for administrators and teachers to manage batches, students, attendance, assessments, quizzes, support requests, and performance analytics from a single platform.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running in Development](#running-in-development)
- [Seeding the Database](#seeding-the-database)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [License](#license)

---

## Features

**Admin Dashboard**

- Institution-wide stats: total students, teachers, active batches, pending assessments
- Class performance analytics with trend charts (scores vs. attendance)
- Upcoming deadline tracking
- Batch, student, and teacher management (create, edit, delete)
- Assessment management and submission review
- Support request handling

**Teacher Dashboard**

- Batch and student management scoped to assigned batches
- Attendance marking with session-based edit locks and CSV export
- Assignment and quiz creation with auto-grading support
- Submission viewing, manual grading, and statistics
- Student performance analytics and OGI (Overall Growth Index) leaderboards
- Support ticket creation and response tracking
- Account settings management

**Platform**

- JWT-based authentication with session persistence
- Role-based route protection (admin / teacher)
- Cloudinary integration for file uploads (assignments, submissions)
- Auto-refreshing dashboard data (60-second intervals)
- Fully responsive layout with mobile sidebar sheet

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React 19, Vite 7                    |
| Styling      | Tailwind CSS 4, Shadcn UI, Radix UI |
| Animation    | Framer Motion                       |
| Charts       | Recharts                            |
| Backend      | Node.js, Express 5                  |
| Database     | MongoDB Atlas (Mongoose 9)          |
| Auth         | JWT + bcryptjs                      |
| File Storage | Cloudinary                          |
| HTTP Client  | Axios                               |

---

## Project Structure

```
NavKalpana-RICR-NK-0003/
├── backend/
│   ├── src/
│   │   ├── config/          # DB and Cloudinary configuration
│   │   ├── controllers/     # Route handler logic
│   │   ├── middlewares/     # Auth and upload middlewares
│   │   ├── models/          # Mongoose schemas
│   │   ├── routers/         # Express route definitions
│   │   ├── seeders/         # Database seed scripts
│   │   └── utils/           # Shared utilities (errors, pagination)
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable UI components
│   │   │   ├── admin/       # Admin-specific forms and modals
│   │   │   ├── common/      # Shared components (PageLoader)
│   │   │   ├── dashboard/   # Layout, header, sidebar components
│   │   │   ├── teacher/     # Teacher sidebar
│   │   │   └── ui/          # Shadcn UI primitives
│   │   ├── config/          # Axios instance
│   │   ├── context/         # Auth context and provider
│   │   ├── lib/             # Utility functions (cn, getGreeting)
│   │   ├── pages/
│   │   │   ├── dashboards/admin/   # Admin page components
│   │   │   ├── teacher/            # Teacher page components
│   │   │   └── Login.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── docs/
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm**
- **MongoDB Atlas** cluster (or local MongoDB instance)
- **Cloudinary** account for file upload support

---

## Environment Variables

Create a `.env` file in both `backend/` and `frontend/` directories. Use the examples below as a reference.

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

## Installation

Clone the repository and install dependencies for both packages.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Running in Development

Start both servers in separate terminals.

```bash
# Terminal 1 — Backend (runs on port 4500)
cd backend
npm run dev

# Terminal 2 — Frontend (runs on port 5173)
cd frontend
npm run dev
```

The frontend proxies API requests to the backend via the `VITE_API_URL` environment variable.

---

## Seeding the Database

Seed scripts are available to populate the database with initial data for development and testing.

```bash
cd backend

# Create the default admin user
npm run seed:admin

# Populate sample student records
npm run seed:students
```

> Run `seed:admin` before `seed:students` to ensure referential integrity.

---

## User Roles

| Role      | Access                                                                               |
| --------- | ------------------------------------------------------------------------------------ |
| `admin`   | Full access to all dashboards, management pages, and analytics                       |
| `teacher` | Access scoped to assigned batches, their students, assessments, quizzes, and support |

Authentication is JWT-based. Tokens are stored in `sessionStorage` and injected into all API requests via an Axios request interceptor. Sessions expire on logout or 401 responses from the server.

---

## API Overview

All routes are prefixed with `/api`.

| Resource         | Base Route         |
| ---------------- | ------------------ |
| Authentication   | `/api/auth`        |
| Dashboard stats  | `/api/dashboard`   |
| Batches          | `/api/batches`     |
| Students         | `/api/students`    |
| Teachers         | `/api/teachers`    |
| Assessments      | `/api/assessments` |
| Attendance       | `/api/attendance`  |
| Support requests | `/api/support`     |
| Contact          | `/api/contact`     |

Protected routes require a valid `Authorization: Bearer <token>` header, handled automatically by the Axios interceptor in `frontend/src/config/Api.jsx`.

---

## License

Built for educational purposes as part of the NavKalpana RICR program. Not licensed for commercial use.
