# Problem Statement

## MINDRISE — Reimagining Classroom Intelligence

### Background

Traditional educational institutions rely heavily on manual, paper-based processes for managing student records, tracking attendance, conducting assessments, and resolving student doubts. This creates significant operational overhead for administrators and teachers, leads to data silos, and makes it nearly impossible to derive actionable insights about student performance and institutional effectiveness.

### Problem

Current classroom management systems face the following critical challenges:

1. **Fragmented Data**: Student attendance, grades, and progress data are stored across disconnected spreadsheets and registers, making it difficult to get a holistic view of student performance.

2. **Manual Attendance Tracking**: Paper-based attendance is time-consuming, error-prone, and lacks real-time analytics. Teachers spend valuable instructional time on administrative tasks.

3. **No Growth Analytics**: There is no mechanism to calculate or track a student's **Overall Growth Index (OGI)** — a composite metric combining attendance and academic performance — which could help identify at-risk students early.

4. **Delayed Doubt Resolution**: Students have no centralized channel to raise academic doubts. Teachers lack a system to prioritize, respond, and schedule backup classes when needed.

5. **Assessment Inefficiency**: Assignment creation, submission tracking, late detection, and grading are all manual processes with no unified workflow.

6. **No Leaderboard Visibility**: There is no transparent ranking mechanism to motivate students and help teachers identify top and bottom performers.

7. **No Historical Trend Tracking**: Academic progress is reviewed only at the end of term, with no week-over-week snapshotting to catch declining performance early.

---

### Proposed Solution

**NavKalpana (Mind Rise)** is a full-stack web-based Classroom Intelligence & Resource Management platform that provides:

- **Role-based dashboards** for Admins and Teachers with real-time KPIs and analytics
- **Batch management** with course module organization, student enrollment workflows, and status-based filtering (Ongoing / Completed / Upcoming)
- **Automated attendance** tracking with Present / Absent / Late classification, mandatory remarks, edit-lock safeguards (10-minute window, same-day only), and CSV export
- **Assessment lifecycle management** for both assignments and quizzes — creation, submission tracking, late detection, and in-app grading with feedback
- **Overall Growth Index (OGI)** — a weighted composite metric: `(Attendance% × 0.4) + (Academic Grade% × 0.6)` — calculated in real-time and classified as Excellent, Improving, Stable, or Needs Attention
- **Weekly performance snapshots** stored historically to enable trend analysis and week-over-week comparison
- **Doubt resolution system** with priority escalation (low → urgent), teacher replies, solution file upload, and backup class scheduling
- **Student Management** with detailed modal views showing course info, progress, and interactive attendance calendar
- **Analytics & Leaderboard** — class-wide OGI trends, attendance heatmaps, submission consistency, and student rankings sortable by OGI, attendance, or assignment score

---

### System Capabilities (Implemented)

| Module             | Key Capabilities                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Authentication     | JWT login, role-based access (Admin, Teacher), bcrypt passwords, HTTP-only cookie sessions |
| Batch Management   | Batch cards with progress bars, status filters, attendance management per session          |
| Attendance         | Mark/edit attendance, calendar view, CSV export, batch and student-level stats             |
| Assessments        | Assignment CRUD, submission handling, late detection, grading with feedback                |
| Quizzes            | MCQ creation, timed attempts, auto-scoring, attempt limits, class average                  |
| Student Management | Search/filter, detail modal with 3 tabs (Course Info, Progress, Attendance), OGI display   |
| Support Requests   | Doubt submission, teacher replies, resolve workflow, backup class scheduling               |
| Analytics          | Class OGI, assignment/quiz averages, heatmap, weekly trend charts, leaderboard             |
| Dashboard          | KPI cards (students, batches, pending evaluations), upcoming deadlines, activity chart     |

---

### Impact

NavKalpana transforms classroom management from a manual, reactive process into a data-driven, proactive system — enabling educators to focus on teaching while the platform handles the operational complexity of attendance, assessment grading, doubt resolution, and performance monitoring.

**Key outcomes for educators:**

- Teachers save time through automated attendance locking, late submission detection, and bulk grading workflows
- Instant visibility into class health via the OGI metric and leaderboard
- Early identification of at-risk students through weekly snapshot trends and growth classification
- Streamlined doubt resolution with priority-based queuing and backup class management

---

> See [`docs/remaining-tasks.md`](remaining-tasks.md) for a feature gap analysis against the full Teacher Module PRD.
> See [`docs/api-documentation.md`](api-documentation.md) for the complete API endpoint reference.
> See [`docs/architecture-diagram.md`](architecture-diagram.md) for system architecture and database schema.
