# 📁 New File Structure Guide

## Overview

Your project has been reorganized with a clear, scalable structure using naming conventions that make it easy to understand what each file does and where it belongs.

---

## 📂 Client Structure

### `/client/src/components/` - Reusable Components

#### `common/` - Shared Components Used Across the App

- `Header.jsx` - Main application header
- `Footer.jsx` - Main application footer

#### `admin/` - Admin Dashboard Components

**Forms:**

- `AdminAssessmentForm.jsx` - Assessment creation/editing form
- `AdminBatchForm.jsx` - Batch management form
- `AdminStudentForm.jsx` - Student creation/editing form
- `AdminTeacherForm.jsx` - Teacher creation/editing form
- `AdminSupportForm.jsx` - Support request form

**Modals & Dialogs:**

- `AdminStudentDetailModal.jsx` - Student details popup
- `AdminSubmissionListModal.jsx` - Submission list popup
- `AdminDeleteConfirmationDialog.jsx` - Delete confirmation dialog
- `AdminModal.jsx` - Generic modal component

#### `dashboard/` - Shared Dashboard Layout Components

- `DashboardTopHeader.jsx` - Top header for all dashboards
- `DashboardMainLayout.jsx` - Main layout container
- `DashboardPlaceholder.jsx` - Placeholder pages
- `Sidebar.jsx` - Main sidebar navigation
- `StudentDashboardContainer.jsx` - Student-specific dashboard layout
- `StudentDashboardContainer.css` - Styling for student dashboard

#### `student/` - Student-Specific Components

- `StudentDashboardHeader.jsx` - Header for student dashboard
- `StudentDashboardSidebar.jsx` - Sidebar for student navigation
- `StudentQuizList.jsx` - Quiz list display
- `QuizAttempt.jsx` - Quiz attempt interface
- `QuizResult.jsx` - Quiz result display

#### `teacher/` - Teacher-Specific Components

- `TeacherCreateQuiz.jsx` - Quiz creation component
- `TeacherDashboard.jsx` - Teacher dashboard layout
- `TeacherDashboardSidebar.jsx` - Teacher sidebar navigation

#### `support/` - Support Feature Components

- `SupportBackupClasses.jsx` - Backup classes widget
- `SupportDoubtsQueries.jsx` - Doubts & queries widget
- `SupportQuickActions.jsx` - Quick actions widget
- `SupportSummaryWidget.jsx` - Support summary display

#### `shared/` - Shared Modal Components

- `StudentProfileModal.jsx` - Student profile displayed across app

#### `ui/` - UI Component Library (Keep as-is)

Shadcn UI components and custom UI elements:

- `avatar.jsx`, `badge.jsx`, `button.jsx`, `calendar.jsx`, `card.jsx`, `dialog.jsx`, `dropdown-menu.jsx`, `input.jsx`, `label.jsx`, `scroll-area.jsx`, `select.jsx`, `separator.jsx`, `sheet.jsx`, `table.jsx`, `tabs.jsx`, `textarea.jsx`

---

### `/client/src/pages/` - Page Components

#### `public/` - Public Pages (No Authentication Required)

- `Home.jsx` - Home page
- `About.jsx` - About page
- `Contact.jsx` - Contact page
- `CoursesPage.jsx` - Available courses listing
- `CourseDetailsPage.jsx` - Individual course details
- `Login.jsx` - Student/User login
- `AdminLogin.jsx` - Admin login page
- `QuizDemo.jsx` - Quiz demonstration page
- `SupportRequests.jsx` - Support requests page

#### `dashboards/` - All Dashboard Pages

##### `dashboards/admin/` - Admin Dashboard Pages

- `AdminHome.jsx` - Admin dashboard home
- `AdminDashboardHome.jsx` - Alternative admin home view
- `AdminDashboard.jsx` - Main admin dashboard
- `AdminAssessment.jsx` - Assessment management
- `AdminAttendance.jsx` - Attendance management
- `AdminBatches.jsx` - Batch management
- `AdminBatchDetail.jsx` - Individual batch details
- `AdminStudents.jsx` - Student management
- `AdminTeachers.jsx` - Teacher management
- `AdminSupport.jsx` - Support requests management

##### `dashboards/student/` - Student Dashboard Pages

- `StudentDashboard.jsx` - Main student dashboard
- `StudentDashboardHome.jsx` - Student dashboard home
- `StudentProfile.jsx` - Student profile edit page
- `StudentQuizzes.jsx` - List of available quizzes
- `StudentQuizQuestions.jsx` - Quiz questions display
- `StudentAssignments.jsx` - Student assignments
- `StudentAttendance.jsx` - Attendance summary

##### `dashboards/teacher/` - Teacher Dashboard Pages

- `TeacherDashboard.jsx` - Main teacher dashboard
- `TeacherHome.jsx` - Teacher dashboard home
- `TeacherDashboardLayout.jsx` - Teacher layout wrapper
- `TeacherQuizzes.jsx` - Quiz management for teachers

#### `quiz/` - Quiz-Related Pages

- `CreateQuiz.jsx` - Quiz creation page

---

## 🎯 Naming Conventions Used

### Prefixes for Clarity:

- **Admin\*** - Components/pages specific to admin dashboard
- **Student\*** - Components/pages specific to student dashboard
- **Teacher\*** - Components/pages specific to teacher dashboard
- **Support\*** - Components related to support feature
- **Dashboard\*** - Generic dashboard layout components
- **ui/** - Reusable UI library components (no prefix needed)

### File Organization Principles:

1. **Grouped by Role** - Admin, Student, Teacher sections keep related files close
2. **Clear Nesting** - Pages organized under `dashboards/` with role-specific subfolders
3. **Container Separation** - Public pages separated from protected dashboard pages
4. **Feature-Based** - Support features in own components folder
5. **Shared Patterns** - Common/UI/Shared folders for reusable code

---

## 📋 Summary of Changes

### Fixed Typos:

- ✅ `dashbords/` → `dashboards/`
- ✅ `AttendenceManagement.jsx` → `AttendanceManagement.jsx`
- ✅ `QuizeCreation.jsx` → `QuizCreation.jsx`
- ✅ `AdminDashbord.jsx` → `AdminDashboard.jsx`

### Folder Renaming:

- ✅ `Student/` → `student/` (proper lowercase)

### New Folders Created:

- ✅ `components/common/` - Shared header/footer
- ✅ `components/shared/` - Shared modals across app
- ✅ `pages/public/` - Public-facing pages
- ✅ `pages/dashboards/` - All dashboard pages
- ✅ `pages/quiz/` - Quiz-specific pages

### Component Prefixing:

- ✅ All admin components now have `Admin` prefix
- ✅ All student components now have `Student` prefix
- ✅ All teacher components now have `Teacher` prefix
- ✅ All support components now have `Support` prefix

---

## 🔄 Next Steps: Update Imports

You'll need to update import statements in your files to reflect the new paths. Here are common patterns:

### Before:

```javascript
import { Header } from "../Header";
import { StudentHeader } from "../Student/StudentHeader";
import AdminPages from "../../pages/admin/AdminPages";
```

### After:

```javascript
import { Header } from "../common/Header";
import { StudentDashboardHeader } from "../student/StudentDashboardHeader";
import AdminPages from "../../pages/dashboards/admin/AdminHome";
```

---

## 📂 Visual Structure

```
client/src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── admin/
│   │   ├── AdminAssessmentForm.jsx
│   │   ├── AdminBatchForm.jsx
│   │   ├── [other Admin components]
│   ├── student/
│   │   ├── StudentDashboardHeader.jsx
│   │   ├── StudentDashboardSidebar.jsx
│   │   ├── [other Student components]
│   ├── teacher/
│   │   ├── TeacherCreateQuiz.jsx
│   │   ├── [other Teacher components]
│   ├── dashboard/
│   │   ├── DashboardTopHeader.jsx
│   │   ├── DashboardMainLayout.jsx
│   │   └── [other Dashboard components]
│   ├── support/
│   │   ├── SupportBackupClasses.jsx
│   │   └── [other Support components]
│   ├── shared/
│   │   └── StudentProfileModal.jsx
│   └── ui/
│       ├── avatar.jsx
│       └── [other UI components]
└── pages/
    ├── public/
    │   ├── Home.jsx
    │   ├── About.jsx
    │   ├── [other public pages]
    └── dashboards/
        ├── admin/
        │   ├── AdminHome.jsx
        │   ├── AdminAssessment.jsx
        │   └── [other admin pages]
        ├── student/
        │   ├── StudentDashboard.jsx
        │   ├── StudentQuizzes.jsx
        │   └── [other student pages]
        └── teacher/
            ├── TeacherHome.jsx
            ├── TeacherQuizzes.jsx
            └── [other teacher pages]
    └── quiz/
        └── CreateQuiz.jsx
```

---

## ✅ Benefits of This Structure

1. **Clarity** - File names immediately tell you what they do and where they belong
2. **Scalability** - Easy to add new pages/components without confusion
3. **Maintainability** - Related files are grouped together
4. **Consistency** - Naming patterns make code predictable
5. **Reduced Errors** - Clear organization reduces import confusion
