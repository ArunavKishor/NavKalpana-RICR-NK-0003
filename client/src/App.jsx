import React from "react";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./pages/dashbords/AdminDashbord";
import AdminLogin from "./pages/public/AdminLogin";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./components/dashboard/DashboardMainLayout";
import DashboardHome from "./pages/dashboards/admin/AdminDashboardHome";
import {
  BatchManagement,
  AssessmentManagement,
  StudentManagement,
  SupportRequests,
  BatchDetail,
  TeacherManagement,
} from "./pages/dashboards/admin/AdminHome";
import AttendanceManagement from "./pages/dashboards/admin/AdminAttendance";
import Login from "./pages/Login";

import TeacherDashboardLayout from "./pages/teacher/TeacherDashboardLayout";
import TeacherDashboardHome from "./pages/teacher/TeacherDashboardHome";
import QuizManagement from "./pages/teacher/QuizManagement";

import StudentDashboardLayout from "./components/dashboard/StudentDashboardLayout";
import StudentDashboardHome from "./pages/student/StudentDashboardHome";
import AssignmentManagement from "./pages/student/AssignmentManagement";
import AttendanceSummary from "./pages/student/AttendanceSummary";
import StudentProfile from "./pages/student/StudentProfile";
import Quizzes from "./pages/student/Quizzes";
import QuizQuestions from "./pages/student/QuizQuestions";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* <Route path="/courses" element={<CoursesPage />} /> */}
          {/* <Route path="/courses/:title" element={<CourseDetailsPage />} /> */}
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/admin" element={<AdminLogin />} />

          <Route path="/admin-dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>

          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="batches/:batchId" element={<BatchDetail />} />
            <Route
              path="batches/:batchId/attendance"
              element={<AttendanceManagement />}
            />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="support" element={<SupportRequests />} />
          </Route>

          {/* Teacher Dashboard Routes */}
          <Route path="/teacher-dashboard" element={<TeacherDashboardLayout />}>
            <Route index element={<TeacherDashboardHome />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="quizzes" element={<QuizManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="support" element={<SupportRequests />} />
          </Route>
          {/* Student Dashboard Routes */}
          <Route path="/student-dashboard" element={<StudentDashboardLayout />}>
            <Route index element={<StudentDashboardHome />} />
            <Route path="assignments" element={<AssignmentManagement />} />
            <Route path="attendance" element={<AttendanceSummary />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="quizzes/:quizId" element={<QuizQuestions />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
