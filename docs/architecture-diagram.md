# Mind Rise System Architecture

This document illustrates the high-level architecture and core data flows of the **Mind Rise** platform.

## 1. High-Level System Diagram

```mermaid
graph TD
    subgraph "Frontend (React + Vite)"
        UI["UI Layer (Tailwind, Framer Motion)"]
        RT["Routing (React Router)"]
        State["State & Auth Context"]
    end

    subgraph "Backend API (Node + Express)"
        Router["Express Routers"]
        MW["Middleware (Auth, Upload, Helmet, Rate Limit)"]
        Ctrl["Controllers (Business Logic)"]
        Util["Utils (OGI, Aggregations)"]
    end

    subgraph "External Services"
        DB[("MongoDB Atlas")]
        CDN["Cloudinary (File Storage)"]
    end

    %% Interactions
    UI --> RT
    RT --> State
    State -- Axios HTTP --> Router
    Router --> MW
    MW --> Ctrl
    Ctrl --> Util
    Ctrl -- Queries --> DB
    Ctrl -- Uploads --> CDN
    CDN -- File URLs --> Ctrl
    DB -- Documents --> Ctrl
    Ctrl -- JSON API --> State
```

## 2. Teacher Module Flow (Mind Rise)

```mermaid
flowchart LR
    TLogin["Teacher Login Page"] --> AuthAPI["POST /api/auth/login"]
    AuthAPI --> JWT["JWT + HttpOnly Cookie"]
    JWT --> TDashboard["Teacher Dashboard"]

    TDashboard --> KPIs["Dashboard KPIs & Charts"]
    TDashboard --> TBatches["Batch Management"]
    TDashboard --> TAssess["Assessment Management"]
    TDashboard --> TStudents["Student Management Views"]
    TDashboard --> TSupport["Support Requests"]

    TBatches --> BatchAPI["/api/batches, /api/attendance"]
    TAssess --> AssessAPI["/api/assessments"]
    TStudents --> StudAPI["/api/students, /api/dashboard/performance"]
    TSupport --> SupportAPI["/api/support"]

    BatchAPI --> DB
    AssessAPI --> DB
    StudAPI --> DB
    SupportAPI --> DB
```

## 3. Key Components

1. **Frontend**
   - React 19 + Vite
   - Tailwind CSS + Framer Motion + Recharts
   - Role-aware routing for Admin, Teacher, and Student dashboards

2. **Backend**
   - Express 5 server with modular routers (`auth`, `students`, `batches`, `attendance`, `assessments`, `support`, `dashboard`, `teachers`, `contact`)
   - JWT-based authentication and role-based authorization middleware
   - Helmet + rate limiting for baseline security

3. **Database**
   - MongoDB Atlas storing Users, Students, Teachers, Batches, Attendance, Assessments, Submissions, SupportRequests, etc.

4. **Storage**
   - Cloudinary used for assignment uploads, support attachments, and batch images, integrated via Multer + CloudinaryStorage with a 10MB upload limit.

5. **Analytics**
   - Overall Growth Index (OGI), attendance summaries, quiz/assignment analytics, and teacher KPIs computed in backend utilities and exposed via `/api/dashboard/*` and student/teacher detail endpoints.
