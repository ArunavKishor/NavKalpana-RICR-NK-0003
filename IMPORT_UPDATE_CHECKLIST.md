# 🔗 Complete Import Update Checklist

This is a comprehensive checklist of every import that needs updating in your project.

## How to Use This Guide

1. **Use Find & Replace** in VS Code (Ctrl+H)
2. **Copy the "Find" pattern** from below
3. **Paste it in the "Find" box**
4. **Copy the "Replace" pattern** and paste in the "Replace" box
5. **Click "Replace All"**
6. **Verify** the replacements look correct
7. **Check console** for any remaining import errors

---

## 🔍 Find & Replace Patterns

### Pattern 1: Header Import

**Find:** `from\s+['\"]([^'\"]*/)Header['\"]`  
**Replace:** `from '$1common/Header'`  
**Details:** Moves Header to common folder

### Pattern 2: Footer Import

**Find:** `from\s+['\"]([^'\"]*/)Footer['\"]`  
**Replace:** `from '$1common/Footer'`  
**Details:** Moves Footer to common folder

### Pattern 3: Dashboard Typo Fix

**Find:** `dashbords`  
**Replace:** `dashboards`  
**Details:** Corrects spelling in all paths

### Pattern 4: Student Folder Case Fix

**Find:** `Student/`  
**Replace:** `student/`  
**Details:** Converts to lowercase consistent naming

### Pattern 5: Attendance Spelling

**Find:** `Attendence`  
**Replace:** `Attendance`  
**Details:** Corrects spelling in filenames

### Pattern 6: Quiz Spelling

**Find:** `Quize`  
**Replace:** `Quiz`  
**Details:** Corrects spelling in filenames

---

## 📋 Component Import Changes

### Admin Components (Add Admin Prefix)

| Old                                | New                                     | Use Pattern                      |
| ---------------------------------- | --------------------------------------- | -------------------------------- |
| `./admin/AssessmentForm`           | `./admin/AdminAssessmentForm`           | Find: `AssessmentForm`           |
| `./admin/BatchForm`                | `./admin/AdminBatchForm`                | Find: `BatchForm`                |
| `./admin/DeleteConfirmationDialog` | `./admin/AdminDeleteConfirmationDialog` | Find: `DeleteConfirmationDialog` |
| `./admin/Modal`                    | `./admin/AdminModal`                    | Find: `from './admin/Modal'`     |
| `./admin/StudentDetailModal`       | `./admin/AdminStudentDetailModal`       | Find: `StudentDetailModal`       |
| `./admin/StudentForm`              | `./admin/AdminStudentForm`              | Find: `StudentForm`              |
| `./admin/SubmissionListModal`      | `./admin/AdminSubmissionListModal`      | Find: `SubmissionListModal`      |
| `./admin/SupportRequestForm`       | `./admin/AdminSupportForm`              | Find: `SupportRequestForm`       |
| `./admin/TeacherForm`              | `./admin/AdminTeacherForm`              | Find: `TeacherForm`              |

### Student Components (Update Names & Paths)

| Old                         | New                                  |
| --------------------------- | ------------------------------------ |
| `../Student/StudentHeader`  | `../student/StudentDashboardHeader`  |
| `../Student/StudentSidebar` | `../student/StudentDashboardSidebar` |
| `../Student/StudentQuizzes` | `../student/StudentQuizList`         |
| `../Student/QuizAttempt`    | `../student/QuizAttempt`             |
| `../Student/QuizResult`     | `../student/QuizResult`              |

### Teacher Components (Update Names & Paths)

| Old                                | New                                 |
| ---------------------------------- | ----------------------------------- |
| `./teacher/CreateQuiz`             | `./teacher/TeacherCreateQuiz`       |
| `./teacher/TeacherDashboardLayout` | `./teacher/TeacherDashboard`        |
| `./teacher/TeacherSidebar`         | `./teacher/TeacherDashboardSidebar` |

### Support Components (Add Support Prefix)

| Old                        | New                              |
| -------------------------- | -------------------------------- |
| `./support/BackupClasses`  | `./support/SupportBackupClasses` |
| `./support/DoubtsQueries`  | `./support/SupportDoubtsQueries` |
| `./support/QuickActions`   | `./support/SupportQuickActions`  |
| `./support/SupportSummary` | `./support/SupportSummaryWidget` |

### Dashboard Components (Update Names)

| Old                                  | New                                     |
| ------------------------------------ | --------------------------------------- |
| `./dashboard/DashboardHeader`        | `./dashboard/DashboardTopHeader`        |
| `./dashboard/DashboardLayout`        | `./dashboard/DashboardMainLayout`       |
| `./dashboard/PlaceholderPage`        | `./dashboard/DashboardPlaceholder`      |
| `./dashboard/StudentDashboardLayout` | `./dashboard/StudentDashboardContainer` |

### Shared Components (New Location)

| Old                      | New                            |
| ------------------------ | ------------------------------ |
| `../StudentProfileModal` | `./shared/StudentProfileModal` |

---

## 📄 Page Import Changes

### Admin Pages

| Old                                   | New                                            |
| ------------------------------------- | ---------------------------------------------- |
| `../pages/admin/AdminPages`           | `../pages/dashboards/admin/AdminHome`          |
| `../pages/admin/AssessmentManagement` | `../pages/dashboards/admin/AdminAssessment`    |
| `../pages/admin/AttendenceManagement` | `../pages/dashboards/admin/AdminAttendance`    |
| `../pages/admin/BatchDetail`          | `../pages/dashboards/admin/AdminBatchDetail`   |
| `../pages/admin/BatchManagement`      | `../pages/dashboards/admin/AdminBatches`       |
| `../pages/admin/DashboardHome`        | `../pages/dashboards/admin/AdminDashboardHome` |
| `../pages/admin/StudentManagement`    | `../pages/dashboards/admin/AdminStudents`      |
| `../pages/admin/SupportRequests`      | `../pages/dashboards/admin/AdminSupport`       |
| `../pages/admin/TeacherManagement`    | `../pages/dashboards/admin/AdminTeachers`      |

### Student Pages

| Old                                     | New                                                |
| --------------------------------------- | -------------------------------------------------- |
| `../pages/student/StudentDashboard`     | `../pages/dashboards/student/StudentDashboard`     |
| `../pages/student/StudentDashboardHome` | `../pages/dashboards/student/StudentDashboardHome` |
| `../pages/student/StudentProfile`       | `../pages/dashboards/student/StudentProfile`       |
| `../pages/student/Quizzes`              | `../pages/dashboards/student/StudentQuizzes`       |
| `../pages/student/QuizQuestions`        | `../pages/dashboards/student/StudentQuizQuestions` |
| `../pages/student/AssignmentManagement` | `../pages/dashboards/student/StudentAssignments`   |
| `../pages/student/AttendanceSummary`    | `../pages/dashboards/student/StudentAttendance`    |

### Teacher Pages

| Old                                       | New                                            |
| ----------------------------------------- | ---------------------------------------------- |
| `../pages/teacher/TeacherDashboardHome`   | `../pages/dashboards/teacher/TeacherHome`      |
| `../pages/teacher/TeacherDashboardLayout` | `../pages/dashboards/teacher/TeacherDashboard` |
| `../pages/teacher/QuizManagement`         | `../pages/dashboards/teacher/TeacherQuizzes`   |

### Public Pages

| Old                          | New                                 |
| ---------------------------- | ----------------------------------- |
| `../pages/Home`              | `../pages/public/Home`              |
| `../pages/About`             | `../pages/public/About`             |
| `../pages/Contact`           | `../pages/public/Contact`           |
| `../pages/CoursesPage`       | `../pages/public/CoursesPage`       |
| `../pages/CourseDetailsPage` | `../pages/public/CourseDetailsPage` |
| `../pages/Login`             | `../pages/public/Login`             |
| `../pages/AdminLogin`        | `../pages/public/AdminLogin`        |
| `../pages/QuizDemo`          | `../pages/public/QuizDemo`          |
| `../pages/SupportRequests`   | `../pages/public/SupportRequests`   |

### Quiz Pages

| Old                                  | New                                  |
| ------------------------------------ | ------------------------------------ |
| `../pages/teacherQuiz/QuizeCreation` | `../pages/quiz/CreateQuiz`           |
| `../pages/dashbords/AdminDashbord`   | `../pages/dashboards/AdminDashboard` |

---

## 🎯 Step-by-Step Update Process

### Step 1: Global Pattern Replacements

Run these basic replacements first (they're safer):

```
1. Find: dashbords → Replace: dashboards ✓
2. Find: Student/  → Replace: student/  ✓
3. Find: Attendence → Replace: Attendance ✓
4. Find: Quize → Replace: Quiz ✓
```

### Step 2: Header & Footer

```
Find: from '../Header'
Replace: from '../common/Header'

Find: from '../Footer'
Replace: from '../common/Footer'
```

### Step 3: Admin Component Imports

Check each file in `src/components/admin/` and update:

```
OLD: import AssessmentForm from './admin/AssessmentForm'
NEW: import AssessmentForm from './admin/AdminAssessmentForm'
```

### Step 4: Student Component Imports

```
OLD: import StudentHeader from '../Student/StudentHeader'
NEW: import StudentHeader from '../student/StudentDashboardHeader'
```

### Step 5: Page Imports in App Router

If you have a router file, update:

```
OLD: import AdminPages from '../pages/admin/AdminPages'
NEW: import AdminHome from '../pages/dashboards/admin/AdminHome'
```

### Step 6: Dashboard Component Imports

```
OLD: import DashboardHeader from '../dashboard/DashboardHeader'
NEW: import DashboardHeader from '../dashboard/DashboardTopHeader'
```

---

## 🧪 Testing After Updates

After updating imports, run these checks:

```bash
# In terminal - check for import errors
npm run dev
# or
pnpm dev
# or
yarn dev
```

Check your browser console for errors like:

- `Cannot find module` - Wrong import path
- `Default export is not a function` - Wrong file name
- `Unexpected token` - Syntax error in import

---

## Special Cases

### CSS File Imports

```javascript
// OLD
import "./StudentDashboardLayout.css";

// NEW
import "./StudentDashboardContainer.css";
```

### Dynamic Imports

If you have dynamic imports:

```javascript
// OLD
const Quiz = lazy(() => import("../pages/teacherQuiz/QuizeCreation"));

// NEW
const Quiz = lazy(() => import("../pages/quiz/CreateQuiz"));
```

### Export/Import in Same Component

```javascript
// OLD
export { default as StudentHeader } from "../Student/StudentHeader";

// NEW
export { default as StudentDashboardHeader } from "../student/StudentDashboardHeader";
```

---

## Files That Must Be Updated

These files **definitely** import components/pages:

- `App.jsx` - Routes and main imports
- `main.jsx` - Entry point
- `pages/*/index.jsx` - If you have index files
- `components/*/index.jsx` - If you have barrel exports
- Any layout files
- Any wrapper components
- Router configuration files
- Any custom hooks that import components

---

## Automated Tools (Optional)

### Using VS Code Extensions

1. Install "Find and Replace in Files" extension
2. Use Regex mode for complex patterns
3. Preview changes before applying

### Using Command Line (if you know bash/zsh)

```bash
# Example: Replace Header imports globally
find ./src -name "*.jsx" -exec sed -i "s|from '[^']*Header'|from '../../common/Header'|g" {} \;
```

---

## Verification Script

After updating imports, run this to check:

```javascript
// Place in a file and run it to audit imports
const fs = require("fs");
const path = require("path");

const checkImports = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (file.endsWith(".jsx")) {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");

      // Check for old patterns
      const oldPatterns = [
        /from\s+['"].*Student\//,
        /from\s+['"].*dashbords/,
        /from\s+['"].*Quize/,
      ];

      oldPatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          console.warn(`⚠️ ${file} may have outdated imports`);
        }
      });
    }
  });
};

checkImports("./src/components");
checkImports("./src/pages");
```

---

## Still Having Issues?

1. **Check file names** - Make sure you're using exact case
2. **Check relative paths** - Count `../` correctly
3. **Check typos** - One character difference breaks imports
4. **Check exports** - Make sure files export what you're importing
5. **Restart dev server** - Sometimes needed after major changes
