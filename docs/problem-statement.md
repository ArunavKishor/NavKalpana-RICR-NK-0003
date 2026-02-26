# Problem Statement

## Mind Rise - Reimagining Classroom Intelligence

### Background

Traditional educational institutions rely heavily on manual, paper-based processes for managing student records, tracking attendance, conducting assessments, and resolving student doubts. This creates operational overhead, data silos, and delays in identifying student performance trends.

### Problem

Key challenges:

1. Fragmented data across spreadsheets and registers
2. Manual attendance tracking with limited analytics
3. No consistent Overall Growth Index (OGI) to identify at-risk students
4. Slow doubt resolution and backup class scheduling
5. Assessment workflows that are manual and difficult to audit
6. No transparent leaderboard or trend tracking

### Proposed Solution

Mind Rise is a full-stack classroom intelligence and resource management platform that provides:

- Role-based dashboards for Admins and Teachers with KPIs
- Batch management with enrollment workflows
- Automated attendance with edit locks and CSV export
- Assessments for assignments and quizzes with grading
- OGI based analytics and weekly performance snapshots
- Support requests with responses and backup class scheduling
- Student management with progress views and attendance calendars

### System Capabilities (Implemented)

| Module | Key Capabilities |
| --- | --- |
| Authentication | JWT login, role-based access, HTTP-only cookie sessions |
| Batch Management | Batch cards, status filters, attendance management |
| Attendance | Mark/edit attendance, CSV export, batch and student stats |
| Assessments | Assignment CRUD, submissions, grading, quiz attempts |
| Student Management | Search/filter, profile detail, OGI display |
| Support Requests | Doubt submission, responses, resolve workflow |
| Analytics | OGI trends, leaderboard, weekly snapshots |
| Dashboard | KPI cards and performance summaries |

### Impact

Mind Rise turns classroom management into a data-driven workflow that saves time for educators and improves visibility into student performance.

See:
- `docs/api-documentation.md`
- `docs/architecture-diagram.md`
