import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import TeacherBatchManagement from "./pages/teacher/TeacherBatchManagement";
import TeacherBatchDetail from "./pages/teacher/TeacherBatchDetail";
import TeacherAssessmentManagement from "./pages/teacher/TeacherAssessmentManagement";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import QuizManagement from "./pages/teacher/QuizManagement";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
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

          {/* Teacher Dashboard Routes (Admin can view too) */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <TeacherDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboardHome />} />
            <Route path="batches" element={<TeacherBatchManagement />} />
            <Route path="batches/:batchId" element={<TeacherBatchDetail />} />
            <Route
              path="assessments"
              element={<TeacherAssessmentManagement />}
            />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="quizzes" element={<QuizManagement />} />
            <Route path="support" element={<SupportRequests />} />
          </Route>


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
