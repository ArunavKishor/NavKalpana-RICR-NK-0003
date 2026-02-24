# Mind Rise — API Documentation

> **Base URL:** `http://localhost:4500/api`
> **Authentication:** JWT Bearer Token (sent via cookie or `Authorization` header)

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint            | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| POST   | `/register`         | —    | Register a new user            |
| POST   | `/login`            | —    | Login and receive JWT token    |
| POST   | `/genOtp`           | —    | **Temporarily disabled** — returns 501 Not Implemented |
| POST   | `/verifyOtp`        | —    | **Temporarily disabled** — returns 501 Not Implemented |
| POST   | `/forgetPasword`    | —    | **Temporarily disabled** — returns 501 Not Implemented |
| POST   | `/logout`           | ✅   | Logout and clear token         |
| GET    | `/me`               | ✅   | Get currently logged-in user   |

---

## 2. Students (`/api/students`)

| Method | Endpoint                | Auth       | Description                         |
|--------|-------------------------|------------|-------------------------------------|
| GET    | `/me/dashboard`         | Student    | Get student's personal dashboard    |
| GET    | `/me`                   | Student    | Get own profile                     |
| PUT    | `/me`                   | Student    | Update own profile                  |
| GET    | `/`                     | Admin/Teacher | List all students               |
| POST   | `/`                     | Admin/Teacher | Create a new student            |
| GET    | `/:id`                  | Admin/Teacher | Get student by ID               |
| PUT    | `/:id`                  | Admin/Teacher | Update student                  |
| DELETE | `/:id`                  | Admin/Teacher | Delete student                  |
| GET    | `/:id/progress`         | Admin/Teacher | Get student progress (OGI)      |
| GET    | `/:id/batches`          | Admin/Teacher | Get student's enrolled batches  |
| POST   | `/:id/enroll`           | Admin/Teacher | Enroll student in a batch       |
| DELETE | `/:id/unenroll`         | Admin/Teacher | Remove student from a batch     |

---

## 3. Batches (`/api/batches`)

| Method | Endpoint                | Auth          | Description                       |
|--------|-------------------------|---------------|-----------------------------------|
| GET    | `/`                     | Admin/Teacher | List all batches                  |
| POST   | `/`                     | Admin/Teacher | Create batch (with image upload)  |
| GET    | `/:id`                  | Admin/Teacher | Get batch by ID                   |
| PUT    | `/:id`                  | Admin/Teacher | Update batch (with image upload)  |
| DELETE | `/:id`                  | Admin/Teacher | Delete batch                      |
| GET    | `/:id/students`         | Admin/Teacher | Get students in a batch           |
| GET    | `/:id/attendance`       | Admin/Teacher | Get attendance for a batch        |

---

## 4. Attendance (`/api/attendance`)

| Method | Endpoint                     | Auth          | Description                                |
|--------|------------------------------|---------------|--------------------------------------------|
| GET    | `/`                          | Admin/Teacher | Get attendance records (filterable)        |
| POST   | `/`                          | Admin/Teacher | Create attendance record (remarks required)|
| GET    | `/export`                    | Admin/Teacher | Export batch attendance as CSV             |
| GET    | `/:id`                       | Admin/Teacher | Get single attendance record               |
| PUT    | `/:id`                       | Admin/Teacher | Update record (10-min lock, same-day only) |
| GET    | `/student/:studentId`        | Admin/Teacher | Get student attendance summary             |
| GET    | `/batch/:batchId`            | Admin/Teacher | Get batch attendance statistics            |

---

## 5. Assessments (`/api/assessments`)

| Method | Endpoint                          | Auth           | Description                          |
|--------|-----------------------------------|----------------|--------------------------------------|
| GET    | `/`                               | Admin/Teacher  | List assessments (filter by type)    |
| POST   | `/`                               | Admin/Teacher  | Create assessment (PDF upload)       |
| GET    | `/:id`                            | Admin/Teacher  | Get assessment by ID                 |
| PUT    | `/:id`                            | Admin/Teacher  | Update assessment                    |
| DELETE | `/:id`                            | Admin/Teacher  | Delete assessment                    |
| GET    | `/:id/submissions`                | Admin/Teacher  | Get all submissions for assessment   |
| POST   | `/:id/submit`                     | Student        | Submit work (late detection, file)   |
| PUT    | `/:id/grade/:submissionId`        | Admin/Teacher  | Grade a submission (marks + feedback)|
| GET    | `/:id/statistics`                 | Admin/Teacher  | Get assessment statistics            |

---

## 6. Dashboard (`/api/dashboard`)

| Method | Endpoint         | Auth          | Description                           |
|--------|------------------|---------------|---------------------------------------|
| GET    | `/stats`         | Admin/Teacher | Global statistics (admin/teacher)     |
| GET    | `/performance`   | Admin/Teacher | Class-wide performance analytics      |
| GET    | `/deadlines`     | Admin/Teacher | Upcoming assessment deadlines         |
| GET    | `/trends`        | Admin/Teacher | Growth trends over time               |

### 6.1 Teacher-specific dashboard endpoints

Some implementations also expose teacher-focused endpoints (if present in the codebase), for example:

| Method | Endpoint                | Auth    | Description                                      |
|--------|-------------------------|---------|--------------------------------------------------|
| GET    | `/teacher/stats`       | Teacher | KPIs for a single teacher (batches, students)    |
| GET    | `/teacher/performance` | Teacher | Weekly performance data for teacher’s assessments|

---

## 7. Support Requests (`/api/support`)

| Method | Endpoint              | Auth           | Description                          |
|--------|-----------------------|----------------|--------------------------------------|
| GET    | `/`                   | Admin/Teacher  | List all support requests            |
| POST   | `/`                   | Student        | Create a new support/doubt request   |
| GET    | `/statistics`         | Admin/Teacher  | Get support request statistics       |
| GET    | `/:id`                | Admin/Teacher  | Get support request by ID            |
| PUT    | `/:id`                | Admin/Teacher  | Update support request               |
| POST   | `/:id/respond`        | Admin/Teacher  | Respond to a support request         |
| PUT    | `/:id/resolve`        | Admin/Teacher  | Resolve request (solution file)      |

---

## 8. Teachers (`/api/teachers`)

| Method | Endpoint      | Auth  | Description           |
|--------|---------------|-------|-----------------------|
| GET    | `/`           | Admin | List all teachers     |
| POST   | `/`           | Admin | Create a new teacher  |
| GET    | `/:id`        | Admin | Get teacher by ID     |
| PUT    | `/:id`        | Admin | Update teacher        |
| DELETE | `/:id`        | Admin | Delete teacher        |

---

## 9. Contact (`/api/contact`)

| Method | Endpoint      | Auth  | Description                     |
|--------|---------------|-------|---------------------------------|
| POST   | `/`           | —     | Submit a contact message        |
| GET    | `/`           | —     | Get all contact messages (Admin)|
| DELETE | `/:id`        | —     | Delete a contact message        |

---

## Error Response Format

All errors return the following JSON structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Authentication Flow

1. **Register** → Creates user account
2. **Login** → Returns JWT token (set as HTTP-only cookie)
3. **Subsequent requests** → Token is automatically sent via cookie
4. **Protected routes** → Middleware checks token validity and user role

---

*Generated from the Mind Rise codebase — Last updated: February 2026*
