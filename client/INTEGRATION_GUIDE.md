// QUICK INTEGRATION GUIDE - Add to your routing

// 1. For Teacher Dashboard - Add this route
import QuizManagement from '@/pages/teacher/QuizManagement';

// In your TeacherDashboardLayout or teacher routes:
<Route path="quizzes" element={<QuizManagement />} />

// 2. For Student Dashboard - Add this route
import StudentQuizzes from '@/components/student/StudentQuizzes';

// In your StudentDashboardLayout or student routes:
<Route path="quizzes" element={<StudentQuizzes studentId="student_1" />} />

// 3. Update Student Sidebar to link to quizzes
// Change the quizzes link route to point to your quiz route

// 4. Add to Teacher Sidebar
{
  icon: FaBook,
  label: "Quizzes",
  href: "/teacher-dashboard/quizzes"
}

// USAGE EXAMPLE
import { useAuth } from '@/context/AuthContext'; // Your auth context
import StudentQuizzes from '@/components/student/StudentQuizzes';

const StudentDashboard = () => {
  const { user } = useAuth();
  return <StudentQuizzes studentId={user?.id} />;
};

// API Endpoints to add (if migrating to backend)
// POST /api/quizzes - Create quiz
// GET /api/quizzes - Get all quizzes
// GET /api/quizzes/:id - Get quiz by ID
// DELETE /api/quizzes/:id - Delete quiz
// POST /api/quiz-attempts - Save attempt
// GET /api/quiz-attempts/:quizId - Get attempts

// IMPORTANT NOTES:
// 1. Currently uses localStorage - works for demo/testing
// 2. For production: Replace quizService with API calls
// 3. Student ID should come from authentication system
// 4. Quiz assignment is automatic (all quizzes assigned to all students)
// 5. Options shuffle is deterministic per student
