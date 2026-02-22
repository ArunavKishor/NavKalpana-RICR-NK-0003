# 📝 Import Path Migration Guide

Use this guide to update all import statements in your project.

## Component Imports Mapping

### Common Components

```javascript
// OLD → NEW
import Header from "../Header";
import Header from "../common/Header";

import Footer from "../Footer";
import Footer from "../common/Footer";
```

### Admin Components

```javascript
// Forms - Add 'Admin' prefix and path
import AssessmentForm from "./admin/AssessmentForm";
import AssessmentForm from "./admin/AdminAssessmentForm";

import BatchForm from "./admin/BatchForm";
import BatchForm from "./admin/AdminBatchForm";

import StudentForm from "./admin/StudentForm";
import StudentForm from "./admin/AdminStudentForm";

import TeacherForm from "./admin/TeacherForm";
import TeacherForm from "./admin/AdminTeacherForm";

import SupportRequestForm from "./admin/SupportRequestForm";
import SupportRequestForm from "./admin/AdminSupportForm";

// Modals
import StudentDetailModal from "./admin/StudentDetailModal";
import StudentDetailModal from "./admin/AdminStudentDetailModal";

import SubmissionListModal from "./admin/SubmissionListModal";
import SubmissionListModal from "./admin/AdminSubmissionListModal";

import DeleteConfirmationDialog from "./admin/DeleteConfirmationDialog";
import DeleteConfirmationDialog from "./admin/AdminDeleteConfirmationDialog";

import Modal from "./admin/Modal";
import Modal from "./admin/AdminModal";
```

### Student Components

```javascript
// Component Path Updates
import StudentHeader from "../Student/StudentHeader";
import StudentHeader from "../student/StudentDashboardHeader";

import StudentSidebar from "../Student/StudentSidebar";
import StudentSidebar from "../student/StudentDashboardSidebar";

import StudentQuizzes from "../Student/StudentQuizzes";
import StudentQuizzes from "../student/StudentQuizList";

import QuizAttempt from "../Student/QuizAttempt";
import QuizAttempt from "../student/QuizAttempt";

import QuizResult from "../Student/QuizResult";
import QuizResult from "../student/QuizResult";
```

### Teacher Components

```javascript
import CreateQuiz from "./teacher/CreateQuiz";
import CreateQuiz from "./teacher/TeacherCreateQuiz";

import TeacherDashboardLayout from "./teacher/TeacherDashboardLayout";
import TeacherDashboardLayout from "./teacher/TeacherDashboard";

import TeacherSidebar from "./teacher/TeacherSidebar";
import TeacherSidebar from "./teacher/TeacherDashboardSidebar";
```

### Support Components

```javascript
import BackupClasses from "./support/BackupClasses";
import BackupClasses from "./support/SupportBackupClasses";

import DoubtsQueries from "./support/DoubtsQueries";
import DoubtsQueries from "./support/SupportDoubtsQueries";

import QuickActions from "./support/QuickActions";
import QuickActions from "./support/SupportQuickActions";

import SupportSummary from "./support/SupportSummary";
import SupportSummary from "./support/SupportSummaryWidget";
```

### Dashboard Components

```javascript
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardHeader from "./dashboard/DashboardTopHeader";

import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardLayout from "./dashboard/DashboardMainLayout";

import PlaceholderPage from "./dashboard/PlaceholderPage";
import PlaceholderPage from "./dashboard/DashboardPlaceholder";

import Sidebar from "./dashboard/Sidebar";
import Sidebar from "./dashboard/Sidebar";

import StudentDashboardLayout from "./dashboard/StudentDashboardLayout";
import StudentDashboardLayout from "./dashboard/StudentDashboardContainer";
```

### Shared Components

```javascript
import StudentProfileModal from "../StudentProfileModal";
import StudentProfileModal from "./shared/StudentProfileModal";
```

---

## Page Imports Mapping

### Public Pages

```javascript
// OLD → NEW
import Home from "../pages/Home";
import Home from "../pages/public/Home";

import About from "../pages/About";
import About from "../pages/public/About";

import Contact from "../pages/Contact";
import Contact from "../pages/public/Contact";

import CoursesPage from "../pages/CoursesPage";
import CoursesPage from "../pages/public/CoursesPage";

import CourseDetailsPage from "../pages/CourseDetailsPage";
import CourseDetailsPage from "../pages/public/CourseDetailsPage";

import Login from "../pages/Login";
import Login from "../pages/public/Login";

import AdminLogin from "../pages/AdminLogin";
import AdminLogin from "../pages/public/AdminLogin";

import QuizDemo from "../pages/QuizDemo";
import QuizDemo from "../pages/public/QuizDemo";

import SupportRequests from "../pages/SupportRequests";
import SupportRequests from "../pages/public/SupportRequests";
```

### Admin Dashboard Pages

```javascript
// OLD → NEW
import AdminPages from "../pages/admin/AdminPages";
import AdminPages from "../pages/dashboards/admin/AdminHome";

import AssessmentManagement from "../pages/admin/AssessmentManagement";
import AssessmentManagement from "../pages/dashboards/admin/AdminAssessment";

import AttendenceManagement from "../pages/admin/AttendenceManagement";
import AttendanceManagement from "../pages/dashboards/admin/AdminAttendance";

import BatchDetail from "../pages/admin/BatchDetail";
import BatchDetail from "../pages/dashboards/admin/AdminBatchDetail";

import BatchManagement from "../pages/admin/BatchManagement";
import BatchManagement from "../pages/dashboards/admin/AdminBatches";

import DashboardHome from "../pages/admin/DashboardHome";
import DashboardHome from "../pages/dashboards/admin/AdminDashboardHome";

import StudentManagement from "../pages/admin/StudentManagement";
import StudentManagement from "../pages/dashboards/admin/AdminStudents";

import SupportRequests from "../pages/admin/SupportRequests";
import SupportRequests from "../pages/dashboards/admin/AdminSupport";

import TeacherManagement from "../pages/admin/TeacherManagement";
import TeacherManagement from "../pages/dashboards/admin/AdminTeachers";
```

### Student Dashboard Pages

```javascript
// OLD → NEW
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentDashboard from "../pages/dashboards/student/StudentDashboard";

import StudentDashboardHome from "../pages/student/StudentDashboardHome";
import StudentDashboardHome from "../pages/dashboards/student/StudentDashboardHome";

import StudentProfile from "../pages/student/StudentProfile";
import StudentProfile from "../pages/dashboards/student/StudentProfile";

import Quizzes from "../pages/student/Quizzes";
import Quizzes from "../pages/dashboards/student/StudentQuizzes";

import QuizQuestions from "../pages/student/QuizQuestions";
import QuizQuestions from "../pages/dashboards/student/StudentQuizQuestions";

import AssignmentManagement from "../pages/student/AssignmentManagement";
import AssignmentManagement from "../pages/dashboards/student/StudentAssignments";

import AttendanceSummary from "../pages/student/AttendanceSummary";
import AttendanceSummary from "../pages/dashboards/student/StudentAttendance";
```

### Teacher Dashboard Pages

```javascript
// OLD → NEW
import TeacherDashboardHome from "../pages/teacher/TeacherDashboardHome";
import TeacherDashboardHome from "../pages/dashboards/teacher/TeacherHome";

import TeacherDashboardLayout from "../pages/teacher/TeacherDashboardLayout";
import TeacherDashboardLayout from "../pages/dashboards/teacher/TeacherDashboard";

import QuizManagement from "../pages/teacher/QuizManagement";
import QuizManagement from "../pages/dashboards/teacher/TeacherQuizzes";
```

### Quiz Pages

```javascript
// OLD → NEW
import QuizeCreation from "../pages/teacherQuiz/QuizeCreation";
import CreateQuiz from "../pages/quiz/CreateQuiz";

import AdminDashboard from "../pages/dashbords/AdminDashbord";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
```

---

## CSS Imports Mapping

```javascript
// OLD → NEW
import "./StudentDashboardLayout.css";
import "./StudentDashboardContainer.css";
```

---

## Quick Search & Replace Patterns

Use your IDE's Find & Replace feature with these patterns:

### For VS Code - Find & Replace regex:

**Pattern 1: Student folder capitalization**

- Find: `from.*Student/(.+)`
- Replace: `from '../student/$1`
- Adjust case for file: `Student(.*).jsx` → `Student$1.jsx`

**Pattern 2: Dashboard typo**

- Find: `dashbords`
- Replace: `dashboards`

**Pattern 3: Attendance spelling**

- Find: `Attendence`
- Replace: `Attendance`

**Pattern 4: Quiz spelling**

- Find: `Quize`
- Replace: `Quiz`

---

## File-by-File Checklist

After running find and replace, verify these key imports:

- [ ] App.jsx - Update all main imports
- [ ] index.html - Update script paths if needed
- [ ] Context/providers - Check auth/context imports
- [ ] Config/Api.jsx - Update route references
- [ ] All page components - Update nested imports
- [ ] All component files - Update local imports
- [ ] CSS files - Update if CSS imports component files
- [ ] Config files - Update require/import paths

---

## Testing

After updating imports:

1. Check console for import errors
2. Test navigation between pages
3. Verify component rendering
4. Check modal/dialog functionality
5. Test admin/student/teacher dashboards
