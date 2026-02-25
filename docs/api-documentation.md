# Mind Rise — API Documentation

> **Base URL:** `http://localhost:4500/api`
> **Authentication:** JWT Bearer Token (sent via cookie or `Authorization` header)

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint    | Auth | Description                  |
| ------ | ----------- | ---- | ---------------------------- |
| POST   | `/register` | --   | Register a new user          |
| POST   | `/login`    | --   | Login and receive JWT token  |
| POST   | `/logout`   | Yes  | Logout and clear token       |
| GET    | `/me`       | Yes  | Get currently logged-in user |

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

**Notes:**

- Teacher role users only see batches assigned to them
- Batch status auto-computes based on start/end dates

---

## 4. Attendance (`/api/attendance`)

| Method | Endpoint              | Auth          | Description                                |
| ------ | --------------------- | ------------- | ------------------------------------------ |
| GET    | `/`                   | Admin/Teacher | Get attendance records (filterable)        |
| POST   | `/`                   | Admin/Teacher | Mark attendance (remarks required)         |
| GET    | `/export`             | Admin/Teacher | Export batch attendance as CSV             |
| GET    | `/:id`                | Admin/Teacher | Get single attendance record               |
| PUT    | `/:id`                | Admin/Teacher | Update record (10-min lock, same-day only) |
| GET    | `/student/:studentId` | Admin/Teacher | Get student attendance summary             |
| GET    | `/batch/:batchId`     | Admin/Teacher | Get batch attendance statistics            |

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
- `search` — Search by title or description
- `startDate`, `endDate` — Filter by due date range

### 5.2 Assignment Submissions

| Method | Endpoint                                  | Auth          | Description                          |
| ------ | ----------------------------------------- | ------------- | ------------------------------------ |
| GET    | `/:id/submissions`                        | Admin/Teacher | Get all submissions for assessment   |
| POST   | `/:id/submit`                             | Any           | Submit assignment (file upload)      |
| PUT    | `/:id/grade/:submissionId`                | Admin/Teacher | Grade submission (marks + feedback)  |
| POST   | `/:id/submissions/:submissionId/evaluate` | Admin/Teacher | Evaluate submission (newer endpoint) |
| GET    | `/:id/statistics`                         | Admin/Teacher | Get assessment statistics            |

**Submission Statuses:** `submitted`, `late-submitted`, `evaluated`

### 5.3 Quiz Questions

| Method | Endpoint                     | Auth          | Description                  |
| ------ | ---------------------------- | ------------- | ---------------------------- |
| GET    | `/:id/questions`             | Admin/Teacher | Get quiz questions (ordered) |
| POST   | `/:id/questions`             | Admin/Teacher | Upsert quiz questions (bulk) |
| DELETE | `/:id/questions/:questionId` | Admin/Teacher | Soft delete a question       |

**Question Format:**

```json
{
  "prompt": "Question text",
  "options": [
    { "text": "Option A", "isCorrect": false },
    { "text": "Option B", "isCorrect": true }
  ],
  "marks": 1,
  "order": 0,
  "explanation": "Optional explanation"
}
```

### 5.4 Quiz Attempts

| Method | Endpoint        | Auth | Description                       |
| ------ | --------------- | ---- | --------------------------------- |
| POST   | `/:id/attempts` | Any  | Submit quiz attempt (auto-scored) |

**Request Body:**

```json
{
  "studentId": "student_id",
  "answers": [{ "questionId": "question_id", "selectedIndex": 1 }]
}
```

**Notes:**

- Quiz attempts are auto-scored based on correct option matching
- `maxAttempts` is enforced by the backend (returns 400 if exceeded)
- A Submission record is also created for analytics integration

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

| Method | Endpoint                         | Auth    | Description                                      |
| ------ | -------------------------------- | ------- | ------------------------------------------------ |
| GET    | `/teacher/stats`                 | Teacher | Teacher KPIs (students, batches, pending grades) |
| GET    | `/teacher/performance`           | Teacher | Weekly performance for teacher's assessments     |
| GET    | `/teacher/analytics`             | Teacher | Full class analytics (OGI, heatmap, trends)      |
| GET    | `/teacher/leaderboard`           | Teacher | Student rankings by OGI/attendance/scores        |
| GET    | `/students/:id/weekly-snapshots` | Teacher | Weekly performance snapshots for a student       |

**Leaderboard Query Parameters:**

- `batchId` — Filter by specific batch
- `course` — Filter by course name
- `sortBy` — `ogi` (default), `attendance`, `assignmentScore`
- `order` — `desc` (default), `asc`

**Weekly Snapshots Query Parameters:**

- `weeks` — Number of weeks to retrieve (default: 8)

---

## 7. Support Requests (`/api/support`)

| Method | Endpoint                     | Auth          | Description                          |
| ------ | ---------------------------- | ------------- | ------------------------------------ |
| GET    | `/`                          | Admin/Teacher | List all support requests            |
| POST   | `/`                          | Any           | Create a new support request         |
| GET    | `/statistics`                | Admin/Teacher | Get support request statistics       |
| GET    | `/:id`                       | Admin/Teacher | Get support request by ID            |
| PUT    | `/:id`                       | Admin/Teacher | Update support request               |
| POST   | `/:id/respond`               | Admin/Teacher | Reply to a support request           |
| PUT    | `/:id/resolve`               | Admin/Teacher | Resolve request (with solution file) |
| POST   | `/:id/schedule-backup-class` | Admin/Teacher | Schedule a backup class              |

**Query Parameters for `GET /`:**

- `status` — `open`, `in-progress`, `resolved`, `closed`
- `priority` — `low`, `medium`, `high`, `urgent`
- `course` — Filter by course name
- `topic` — Filter by topic
- `search` — Search by subject or description

**Backup Class Schedule Body:**

```json
{
  "date": "2026-03-01T10:00:00.000Z",
  "topic": "Review Session",
  "meetingLink": "https://meet.example.com/xyz"
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

All errors return the following JSON structure:

```json
{
  "message": "Error description"
}
```

Validation errors include additional detail:

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title is required" }]
}
```

---

## Authentication Flow

```
1. POST /api/auth/login  →  Validate credentials  →  Generate JWT (24h expiry)
2. JWT set as HTTP-only cookie + returned in response body
3. Axios interceptor attaches Bearer token to all subsequent requests
4. Protected routes verify token via authMiddleware (protect + authorize)
5. 401 response triggers auto-redirect to login page
```

**Cookie Configuration:**

- `httpOnly: true` — Prevents XSS access
- `secure: true` — HTTPS only (production)
- `sameSite: "strict"` — CSRF protection
- `maxAge: 86400000` — 24 hours

---

## OGI (Overall Growth Index) Formula

Used across analytics and leaderboard endpoints:

```
OGI = (Attendance% x 0.4) + (Academic Grade% x 0.6)
```

**Growth Classification:**
| OGI Range | Classification |
|-----------|---------------|
| >= 80% | Excellent |
| >= 60% | Improving |
| >= 40% | Stable |
| < 40% | Needs Attention |

---

_Generated from the Mind Rise codebase — Last updated: February 2026_
