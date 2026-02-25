# Mind Rise — API Documentation

> **Base URL:** `http://localhost:4500/api`
> **Authentication:** JWT Bearer Token (sent via HTTP-only cookie or `Authorization: Bearer <token>` header)
> **Last Updated:** February 2026

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint    | Auth | Description                       |
| ------ | ----------- | ---- | --------------------------------- |
| POST   | `/register` | --   | Register a new user               |
| POST   | `/login`    | --   | Login and receive JWT token       |
| POST   | `/logout`   | Yes  | Logout and clear HTTP-only cookie |
| GET    | `/me`       | Yes  | Get currently logged-in user      |

**Login Request Body:**

```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Login Response:**

```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": { "_id": "...", "name": "...", "role": "teacher" }
}
```

---

## 2. Students (`/api/students`)

| Method | Endpoint        | Auth          | Description                        |
| ------ | --------------- | ------------- | ---------------------------------- |
| GET    | `/me/dashboard` | Student       | Get student's personal dashboard   |
| GET    | `/me`           | Student       | Get own profile                    |
| PUT    | `/me`           | Student       | Update own profile                 |
| GET    | `/`             | Admin/Teacher | List all students (paginated)      |
| POST   | `/`             | Admin/Teacher | Create a new student               |
| GET    | `/:id`          | Admin/Teacher | Get student by ID                  |
| PUT    | `/:id`          | Admin/Teacher | Update student                     |
| DELETE | `/:id`          | Admin/Teacher | Soft delete student                |
| GET    | `/:id/progress` | Admin/Teacher | Get student progress (OGI, grades) |
| GET    | `/:id/batches`  | Admin/Teacher | Get student's enrolled batches     |
| POST   | `/:id/enroll`   | Admin/Teacher | Enroll student in a batch          |
| DELETE | `/:id/unenroll` | Admin/Teacher | Remove student from a batch        |

**Query Parameters for `GET /`:**

- `status` — Filter by: `active`, `completed`
- `search` — Search by name, email, enrollment ID
- `course` — Filter by course name
- `page`, `limit` — Pagination

---

## 3. Batches (`/api/batches`)

| Method | Endpoint            | Auth          | Description                              |
| ------ | ------------------- | ------------- | ---------------------------------------- |
| GET    | `/`                 | Admin/Teacher | List batches (teacher-scoped if teacher) |
| POST   | `/`                 | Admin/Teacher | Create batch (with cover image upload)   |
| GET    | `/:id`              | Admin/Teacher | Get batch by ID (auto-updates status)    |
| PUT    | `/:id`              | Admin/Teacher | Update batch (with cover image upload)   |
| DELETE | `/:id`              | Admin/Teacher | Soft delete batch                        |
| GET    | `/:id/students`     | Admin/Teacher | Get students enrolled in batch           |
| GET    | `/:id/attendance`   | Admin/Teacher | Get attendance records for batch         |
| POST   | `/:id/upload-cover` | Admin/Teacher | Upload batch cover image                 |

**Query Parameters for `GET /`:**

- `status` — Filter by: `upcoming`, `ongoing`, `completed`
- `course` — Filter by course name
- `search` — Search by name or course

**Batch Create/Update Body:**

```json
{
  "name": "Web Development Batch - Jan 2026",
  "type": "WEB Batch",
  "course": "Full Stack Web Development",
  "startDate": "2026-01-15",
  "endDate": "2026-06-15",
  "maxStudents": 30,
  "instructor": "<teacher_id>"
}
```

**Notes:**

- Teacher role users only see batches assigned to them
- Batch `status` auto-computes as `upcoming` / `ongoing` / `completed` based on start/end dates
- `type` field (e.g., WEB Batch, DSA Batch) is required for display on batch cards

---

## 4. Attendance (`/api/attendance`)

| Method | Endpoint              | Auth          | Description                                  |
| ------ | --------------------- | ------------- | -------------------------------------------- |
| GET    | `/`                   | Admin/Teacher | Get attendance records (filterable)          |
| POST   | `/`                   | Admin/Teacher | Mark attendance (remarks required)           |
| GET    | `/export`             | Admin/Teacher | Export batch attendance as CSV               |
| GET    | `/:id`                | Admin/Teacher | Get single attendance record                 |
| PUT    | `/:id`                | Admin/Teacher | Update record (10-min lock, same-day only)   |
| GET    | `/student/:studentId` | Admin/Teacher | Get student attendance summary               |
| GET    | `/batch/:batchId`     | Admin/Teacher | Get batch attendance statistics              |
| GET    | `/my`                 | Student       | Get own attendance records _(pending — M13)_ |

**Mark Attendance Body:**

```json
{
  "batchId": "<batch_id>",
  "date": "2026-02-26",
  "records": [
    { "studentId": "<id>", "status": "present", "remarks": "On time" },
    { "studentId": "<id>", "status": "absent", "remarks": "No show" },
    { "studentId": "<id>", "status": "late", "remarks": "Arrived 15 mins late" }
  ],
  "sessionRemarks": "Chapter 3 covered"
}
```

**Edit Constraints:**

- Records can only be edited on the **same day** they were created
- Edit window closes **10 minutes** after initial submission
- Remarks are **mandatory** for all attendance records

---

## 5. Assessments (`/api/assessments`)

### 5.1 Assessment CRUD

| Method | Endpoint | Auth          | Description                              |
| ------ | -------- | ------------- | ---------------------------------------- |
| GET    | `/`      | Admin/Teacher | List assessments (filter by type/status) |
| POST   | `/`      | Admin/Teacher | Create assessment (PDF + image upload)   |
| GET    | `/:id`   | Admin/Teacher | Get assessment by ID                     |
| PUT    | `/:id`   | Admin/Teacher | Update assessment (PDF + image upload)   |
| DELETE | `/:id`   | Admin/Teacher | Soft delete assessment                   |

**Query Parameters for `GET /`:**

- `type` — `assignment` or `quiz`
- `status` — `draft`, `published`, `closed`
- `batch` — Filter by batch ID
- `lesson` — Filter by lesson/module name
- `search` — Search by title or description
- `startDate`, `endDate` — Filter by due date range

**Assessment Create Body:**

```json
{
  "title": "Week 3 Assignment — CSS Layouts",
  "type": "assignment",
  "batch": "<batch_id>",
  "lesson": "CSS Fundamentals",
  "description": "Build a responsive layout using Flexbox and Grid",
  "deadline": "2026-03-01T23:59:00.000Z",
  "maxMarks": 100,
  "submissionType": ["pdf", "image"],
  "duration": null
}
```

### 5.2 Assignment Submissions

| Method | Endpoint                                  | Auth          | Description                              |
| ------ | ----------------------------------------- | ------------- | ---------------------------------------- |
| GET    | `/:id/submissions`                        | Admin/Teacher | Get all submissions for assessment       |
| POST   | `/:id/submit`                             | Student       | Submit assignment (file upload)          |
| PUT    | `/:id/grade/:submissionId`                | Admin/Teacher | Grade submission (marks + feedback)      |
| POST   | `/:id/submissions/:submissionId/evaluate` | Admin/Teacher | Evaluate submission (alternate endpoint) |
| GET    | `/:id/statistics`                         | Admin/Teacher | Get assessment statistics                |

**Submission Statuses:** `submitted`, `late-submitted`, `evaluated`

**Note:** Students who have not submitted will show status `not-submitted` when cross-referencing enrolled students against submissions _(pending — H3)_

**Grade Body:**

```json
{
  "marks": 85,
  "feedback": "Good work on Flexbox. Grid layout needs improvement."
}
```

### 5.3 Quiz Questions

| Method | Endpoint                     | Auth          | Description                  |
| ------ | ---------------------------- | ------------- | ---------------------------- |
| GET    | `/:id/questions`             | Admin/Teacher | Get quiz questions (ordered) |
| POST   | `/:id/questions`             | Admin/Teacher | Upsert quiz questions (bulk) |
| DELETE | `/:id/questions/:questionId` | Admin/Teacher | Soft delete a question       |

**Question Format:**

```json
{
  "prompt": "Which CSS property controls element spacing inside the border?",
  "options": [
    { "text": "margin", "isCorrect": false },
    { "text": "padding", "isCorrect": true },
    { "text": "border-spacing", "isCorrect": false },
    { "text": "gap", "isCorrect": false }
  ],
  "marks": 2,
  "order": 0,
  "explanation": "padding controls the space between the content and the border."
}
```

### 5.4 Quiz Attempts

| Method | Endpoint        | Auth          | Description                                   |
| ------ | --------------- | ------------- | --------------------------------------------- |
| POST   | `/:id/attempts` | Student       | Submit quiz attempt (auto-scored)             |
| GET    | `/:id/attempts` | Admin/Teacher | List all attempts for a quiz _(pending — H2)_ |

**Submit Attempt Body:**

```json
{
  "studentId": "<student_id>",
  "answers": [{ "questionId": "<question_id>", "selectedIndex": 1 }]
}
```

**Notes:**

- Quiz attempts are auto-scored based on correct option matching
- `maxAttempts` is enforced by the backend (returns 400 if limit exceeded)
- A Submission record is also created for analytics integration
- Attempt limit per student is enforced server-side

---

## 6. Dashboard (`/api/dashboard`)

### 6.1 Global Endpoints

| Method | Endpoint       | Auth          | Description                   |
| ------ | -------------- | ------------- | ----------------------------- |
| GET    | `/stats`       | Admin/Teacher | Global statistics             |
| GET    | `/performance` | Admin/Teacher | Class-wide performance data   |
| GET    | `/deadlines`   | Admin/Teacher | Upcoming assessment deadlines |
| GET    | `/trends`      | Admin/Teacher | Growth trends over time       |

### 6.2 Teacher-Specific Endpoints

| Method | Endpoint                         | Auth    | Description                                                    |
| ------ | -------------------------------- | ------- | -------------------------------------------------------------- |
| GET    | `/teacher/stats`                 | Teacher | Teacher KPIs (total students, batches, pending to grade)       |
| GET    | `/teacher/performance`           | Teacher | Weekly performance for teacher's assessments                   |
| GET    | `/teacher/analytics`             | Teacher | Full class analytics (OGI, heatmap, trends, module comparison) |
| GET    | `/teacher/leaderboard`           | Teacher | Student rankings by OGI / attendance / assignment score        |
| GET    | `/students/:id/weekly-snapshots` | Teacher | Weekly performance snapshots for a specific student            |

**`/teacher/stats` Response:**

```json
{
  "totalStudents": 45,
  "activeBatches": 3,
  "pendingEvaluations": 12,
  "completedBatches": 2
}
```

**Leaderboard Query Parameters:**

- `batchId` — Filter by specific batch
- `course` — Filter by course name _(fix pending — C4)_
- `sortBy` — `ogi` (default), `attendance`, `assignmentScore`
- `order` — `desc` (default), `asc`

**Weekly Snapshots Query Parameters:**

- `weeks` — Number of weeks to retrieve (default: 8)

**Weekly Snapshot Response (per student):**

```json
{
  "week": "2026-W07",
  "quizAverage": 78.5,
  "assignmentAverage": 82.0,
  "completionRate": 0.9,
  "submissionConsistency": 0.85,
  "ogi": 75.2,
  "weekOverWeekChange": 3.4,
  "trendDirection": "improving"
}
```

---

## 7. Support Requests (`/api/support`)

| Method | Endpoint                     | Auth          | Description                                       |
| ------ | ---------------------------- | ------------- | ------------------------------------------------- |
| GET    | `/`                          | Admin/Teacher | List all support requests                         |
| POST   | `/`                          | Any           | Create a new support request                      |
| GET    | `/statistics`                | Admin/Teacher | Get support request statistics                    |
| GET    | `/:id`                       | Admin/Teacher | Get support request by ID                         |
| PUT    | `/:id`                       | Admin/Teacher | Update support request                            |
| DELETE | `/:id`                       | Admin         | Delete support request _(pending — C3)_           |
| POST   | `/:id/respond`               | Admin/Teacher | Reply to a support request                        |
| PUT    | `/:id/resolve`               | Admin/Teacher | Resolve request (with solution file URL)          |
| POST   | `/:id/schedule-backup-class` | Admin/Teacher | Schedule a backup class                           |
| PUT    | `/:id/approve-backup`        | Admin/Teacher | Approve a scheduled backup class _(pending — H4)_ |

**Query Parameters for `GET /`:**

- `status` — `open`, `in-progress`, `resolved`, `closed`
- `priority` — `low`, `medium`, `high`, `urgent`
- `course` — Filter by course name
- `topic` — Filter by topic/category
- `search` — Search by subject or description

**Support Request Create Body:**

```json
{
  "subject": "Doubt in CSS Grid",
  "description": "I don't understand how grid-template-areas works.",
  "category": "academic",
  "priority": "medium",
  "course": "Full Stack Web Development",
  "topic": "CSS",
  "attachmentUrl": "https://cloudinary.com/..."
}
```

**Respond Body:**

```json
{
  "message": "Please refer to the MDN docs link I've shared below."
}
```

**Resolve Body:**

```json
{
  "solutionUrl": "https://cloudinary.com/solution-file.pdf"
}
```

**Backup Class Schedule Body:**

```json
{
  "date": "2026-03-01T10:00:00.000Z",
  "topic": "CSS Grid Review Session",
  "meetingLink": "https://meet.example.com/xyz"
}
```

**Support Statistics Response:**

```json
{
  "total": 45,
  "open": 12,
  "inProgress": 8,
  "resolved": 20,
  "closed": 5,
  "byPriority": { "urgent": 3, "high": 9, "medium": 25, "low": 8 }
}
```

---

## 8. Teachers (`/api/teachers`)

| Method | Endpoint            | Auth          | Description                   |
| ------ | ------------------- | ------------- | ----------------------------- |
| GET    | `/`                 | Admin         | List all teachers             |
| POST   | `/`                 | Admin         | Create a new teacher          |
| GET    | `/me`               | Teacher       | Get own teacher profile       |
| GET    | `/:id`              | Admin         | Get teacher by ID             |
| PUT    | `/:id`              | Admin/Teacher | Update teacher (email, phone) |
| DELETE | `/:id`              | Admin         | Soft delete teacher           |
| POST   | `/:id/upload-photo` | Teacher       | Upload profile photo          |

---

## 9. Contact (`/api/contact`)

| Method | Endpoint | Auth  | Description              |
| ------ | -------- | ----- | ------------------------ |
| POST   | `/`      | --    | Submit a contact message |
| GET    | `/`      | Admin | Get all contact messages |
| DELETE | `/:id`   | Admin | Delete a contact message |

---

## Error Response Format

All errors return:

```json
{
  "message": "Error description"
}
```

Validation errors include field-level detail:

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title is required" }]
}
```

**Common HTTP Status Codes:**

| Code | Meaning                         |
| ---- | ------------------------------- |
| 200  | Success                         |
| 201  | Created                         |
| 400  | Bad request / validation error  |
| 401  | Unauthorized (no/invalid token) |
| 403  | Forbidden (wrong role)          |
| 404  | Resource not found              |
| 409  | Conflict (duplicate)            |
| 500  | Internal server error           |

---

## Authentication Flow

```
1. POST /api/auth/login  →  Validate credentials  →  Generate JWT (24h expiry)
2. JWT set as HTTP-only cookie AND returned in response body
3. Axios interceptor attaches Bearer token to all subsequent requests
4. Protected routes verify token via authMiddleware (protect + authorize)
5. 401 response triggers auto-redirect to login page
6. POST /api/auth/logout  →  Clears HTTP-only cookie server-side
```

**Cookie Configuration:**

- `httpOnly: true` — Prevents XSS access
- `secure: true` — HTTPS only (production)
- `sameSite: "strict"` — CSRF protection
- `maxAge: 86400000` — 24 hours

---

## OGI (Overall Growth Index) Formula

Used across analytics, leaderboard, and student progress endpoints:

```
OGI = (Attendance% × 0.4) + (Academic Grade% × 0.6)
```

**Growth Classification:**

| OGI Range | Classification  |
| --------- | --------------- |
| >= 80%    | Excellent       |
| >= 60%    | Improving       |
| >= 40%    | Stable          |
| < 40%     | Needs Attention |

---

## Pending API Items

Items marked as pending above correspond to tracked tasks in `docs/remaining-tasks.md`:

| Endpoint                                 | Task                           | Priority |
| ---------------------------------------- | ------------------------------ | -------- |
| `GET /api/assessments/:id/attempts`      | H2 — Quiz attempt history      | High     |
| `DELETE /api/support/:id`                | C3 — Delete support request    | Critical |
| `PUT /api/support/:id/approve-backup`    | H4 — Backup class approval     | High     |
| `GET /api/attendance/my`                 | M13 — Student attendance route | Medium   |
| `GET /api/assessments` — `lesson` filter | H13 — Lesson-wise assessments  | High     |

---

_Generated from the Mind Rise codebase — Last updated: February 2026_
