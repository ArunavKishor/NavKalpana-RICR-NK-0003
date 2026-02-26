# Mind Rise

Classroom Intelligence and Resource Management Platform.

Mind Rise is a full-stack web app that helps admins and teachers manage batches, attendance, assessments, support requests, and performance analytics in one place.

## Features

- Role-based dashboards for admins and teachers
- Batch and student management with enrollment workflows
- Attendance marking with edit locks and CSV export
- Assignments and quizzes with submissions, grading, and statistics
- Support requests with responses and backup class scheduling
- Analytics and leaderboards based on OGI (Overall Growth Index)

## Tech Stack

- Frontend: React 19, Vite 7, Tailwind CSS 4, Radix UI, Recharts
- Backend: Node.js, Express 5, Mongoose 9
- Database: MongoDB Atlas
- Auth: JWT with HTTP-only cookies
- Storage: Cloudinary

## Project Structure

```
hac/
|-- backend/
|   |-- src/
|   |-- server.js
|   |-- package.json
|-- frontend/
|   |-- src/
|   |-- index.html
|   |-- package.json
|-- docs/
|-- env.example
|-- README.md
```

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm or npm
- MongoDB Atlas or local MongoDB
- Cloudinary account (for uploads)

### Install

```bash
cd backend
pnpm install

cd ../frontend
pnpm install
```

### Environment Variables

Use the root `env.example` as a reference.

- Copy the backend values into `backend/.env`
- Copy the frontend values into `frontend/.env`

### Run (Development)

```bash
# backend
cd backend
pnpm dev

# frontend
cd ../frontend
pnpm dev
```

### Seed Data (Optional)

```bash
cd backend
pnpm run seed:admin
pnpm run seed:students
```

## Documentation

- `docs/problem-statement.md`
- `docs/architecture-diagram.md`
- `docs/api-documentation.md`

## License

This project is built for educational purposes as part of the RICR program.
