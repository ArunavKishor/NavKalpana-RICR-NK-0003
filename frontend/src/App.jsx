import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import DashboardLayout from "./components/dashboard/DashboardMainLayout";
import DashboardHome from "./pages/dashboards/admin/AdminDashboardHome";
import Login from "./pages/Login";
import {
  BatchManagement,
  AssessmentManagement,
  StudentManagement,
  SupportRequests,
  BatchDetail,
  TeacherManagement,
} from "./pages/dashboards/admin/AdminHome";

import TeacherDashboardLayout from "./pages/teacher/TeacherDashboardLayout";
import TeacherDashboardHome from "./pages/teacher/TeacherDashboardHome";
import TeacherBatchManagement from "./pages/teacher/TeacherBatchManagement";
import TeacherBatchDetail from "./pages/teacher/TeacherBatchDetail";
import TeacherStudentManagement from "./pages/teacher/TeacherStudentManagement";
import TeacherAssessmentManagement from "./pages/teacher/TeacherAssessmentManagement";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import QuizManagement from "./pages/teacher/QuizManagement";
import TeacherSupport from "./pages/teacher/TeacherSupport";
import TeacherAccount from "./pages/teacher/TeacherAccount";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Legacy route catch-all */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="batches/:batchId" element={<BatchDetail />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="assessments" element={<AssessmentManagement />} />
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
            <Route path="students" element={<TeacherStudentManagement />} />
            <Route
              path="assessments"
              element={<TeacherAssessmentManagement />}
            />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="quizzes" element={<QuizManagement />} />
            <Route path="support" element={<TeacherSupport />} />
            <Route path="account" element={<TeacherAccount />} />
          </Route>


        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
