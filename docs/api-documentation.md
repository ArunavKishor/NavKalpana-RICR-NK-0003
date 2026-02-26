# Mind Rise API Documentation

Base URL: `http://localhost:4500/api`
Authentication: JWT via HTTP-only cookie or `Authorization: Bearer <token>` header
Last updated: February 26, 2026

## Authentication (/api/auth)

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT token |
| POST | `/logout` | Authenticated | Logout and clear cookie |
| GET | `/me` | Authenticated | Get current user |

## Students (/api/students)

All routes require authentication and `admin` or `teacher` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | List students |
| POST | `/` | Create student |
| GET | `/:id` | Get student by ID |
| PUT | `/:id` | Update student |
| DELETE | `/:id` | Delete student |
| GET | `/:id/progress` | Student progress |
| GET | `/:id/batches` | Student batches |
| GET | `/:id/attendance` | Student attendance summary |
| POST | `/:id/enroll` | Enroll student in batch |
| POST | `/:id/unenroll` | Unenroll student from batch |

## Batches (/api/batches)

All routes require authentication and `admin` or `teacher` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | List batches |
| POST | `/` | Create batch (image upload) |
| GET | `/:id` | Get batch by ID |
| PUT | `/:id` | Update batch (image upload) |
| DELETE | `/:id` | Delete batch |
| GET | `/:id/students` | Batch students |
| GET | `/:id/attendance` | Batch attendance |
| POST | `/:id/upload-cover` | Upload cover image |

## Attendance (/api/attendance)

All routes require authentication.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/my` | Student | Get own attendance |
| GET | `/` | Admin/Teacher | List attendance |
| POST | `/` | Admin/Teacher | Mark attendance |
| GET | `/export` | Admin/Teacher | Export CSV |
| GET | `/:id` | Admin/Teacher | Get attendance by ID |
| PUT | `/:id` | Admin/Teacher | Update attendance |
| GET | `/student/:studentId` | Admin/Teacher | Student attendance stats |
| GET | `/batch/:batchId` | Admin/Teacher | Batch attendance stats |

## Assessments (/api/assessments)

All routes require authentication.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Admin/Teacher | List assessments |
| POST | `/` | Admin/Teacher | Create assessment (pdf/image upload) |
| GET | `/:id` | Admin/Teacher | Get assessment |
| PUT | `/:id` | Admin/Teacher | Update assessment (pdf/image upload) |
| DELETE | `/:id` | Admin/Teacher | Delete assessment |
| GET | `/:id/submissions` | Admin/Teacher | List submissions |
| POST | `/:id/submit` | Admin/Teacher | Submit assessment file |
| PUT | `/:id/grade/:submissionId` | Admin/Teacher | Grade submission |
| POST | `/:id/submissions/:submissionId/evaluate` | Admin/Teacher | Evaluate submission |
| GET | `/:id/statistics` | Admin/Teacher | Assessment statistics |
| GET | `/:id/questions` | Admin/Teacher | Get quiz questions |
| POST | `/:id/questions` | Admin/Teacher | Upsert quiz questions |
| DELETE | `/:id/questions/:questionId` | Admin/Teacher | Delete quiz question |
| POST | `/:id/attempts/start` | Authenticated | Start quiz attempt |
| POST | `/:id/attempts` | Authenticated | Submit quiz attempt |
| GET | `/:id/attempts` | Admin/Teacher | List quiz attempts |

## Dashboard (/api/dashboard)

All routes require authentication and `admin` or `teacher` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/stats` | Global stats |
| GET | `/performance` | Performance analytics |
| GET | `/deadlines` | Upcoming deadlines |
| GET | `/trends` | Trend data |
| GET | `/teacher/stats` | Teacher KPIs |
| GET | `/teacher/performance` | Teacher performance |
| GET | `/teacher/analytics` | Class analytics |
| GET | `/teacher/leaderboard` | Leaderboard |
| GET | `/students/:id/weekly-snapshots` | Weekly snapshots |

## Support (/api/support)

All routes require authentication.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Admin/Teacher | List support requests |
| POST | `/` | Student/Admin | Create support request |
| GET | `/statistics` | Admin/Teacher | Support stats |
| GET | `/:id` | Admin/Teacher | Get support request |
| PUT | `/:id` | Admin/Teacher | Update support request |
| DELETE | `/:id` | Admin/Teacher | Delete support request |
| POST | `/:id/respond` | Admin/Teacher | Respond to request |
| PUT | `/:id/resolve` | Admin/Teacher | Resolve (file upload) |
| POST | `/:id/schedule-backup-class` | Admin/Teacher | Schedule backup class |
| PUT | `/:id/approve-backup-class` | Admin | Approve backup class |

## Teachers (/api/teachers)

All routes require authentication.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/me` | Teacher | Get own teacher profile |
| GET | `/` | Admin/Teacher | List teachers |
| POST | `/` | Admin | Create teacher |
| GET | `/:id` | Authenticated | Get teacher by ID |
| PUT | `/:id` | Authenticated | Update teacher |
| DELETE | `/:id` | Authenticated | Delete teacher |
| POST | `/:id/upload-photo` | Authenticated | Upload profile photo |

## Contact (/api/contact)

No authentication middleware is applied in the current router.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/` | Submit contact message |
| GET | `/` | List contact messages |
| DELETE | `/:id` | Delete contact message |

## Error Format

```json
{ "message": "Error description" }
```
