import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import PageLoader from "@/components/common/PageLoader";
import ProtectedRoute from "./components/ProtectedRoute";

const DashboardLayout = lazy(() => import("./components/dashboard/DashboardMainLayout"));
const DashboardHome = lazy(() => import("./pages/dashboards/admin/AdminDashboardHome"));
const Login = lazy(() => import("./pages/Login"));
const BatchManagement = lazy(() => import("./pages/dashboards/admin/AdminBatches"));
const StudentManagement = lazy(() => import("./pages/dashboards/admin/AdminStudents"));
const SupportRequests = lazy(() => import("./pages/dashboards/admin/AdminSupport"));
const BatchDetail = lazy(() => import("./pages/dashboards/admin/BatchDetail"));
const TeacherManagement = lazy(() => import("./pages/dashboards/admin/AdminTeachers"));
const TeacherDashboardLayout = lazy(() => import("./pages/teacher/TeacherDashboardLayout"));
const TeacherDashboardHome = lazy(() => import("./pages/teacher/TeacherDashboardHome"));
const TeacherBatchManagement = lazy(() => import("./pages/teacher/TeacherBatchManagement"));
const TeacherBatchDetail = lazy(() => import("./pages/teacher/TeacherBatchDetail"));
const TeacherStudentManagement = lazy(() => import("./pages/teacher/TeacherStudentManagement"));
const TeacherAssessmentManagement = lazy(() => import("./pages/teacher/TeacherAssessmentManagement"));
const TeacherAnalytics = lazy(() => import("./pages/teacher/TeacherAnalytics"));
const QuizManagement = lazy(() => import("./pages/teacher/QuizManagement"));
const TeacherSupport = lazy(() => import("./pages/teacher/TeacherSupport"));
const TeacherAccount = lazy(() => import("./pages/teacher/TeacherAccount"));

const withSuspense = (element) => (
  <Suspense fallback={<PageLoader />}>
    {element}
  </Suspense>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={withSuspense(<Login />)} />

          {/* Legacy route catch-all */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                {withSuspense(<DashboardLayout />)}
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={withSuspense(<DashboardHome />)} />
            <Route path="batches" element={withSuspense(<BatchManagement />)} />
            <Route path="batches/:batchId" element={withSuspense(<BatchDetail />)} />
            <Route path="teachers" element={withSuspense(<TeacherManagement />)} />
            <Route path="students" element={withSuspense(<StudentManagement />)} />
            <Route path="support" element={withSuspense(<SupportRequests />)} />
          </Route>

          {/* Teacher Dashboard Routes (Admin can view too) */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                {withSuspense(<TeacherDashboardLayout />)}
              </ProtectedRoute>
            }
          >
            <Route index element={withSuspense(<TeacherDashboardHome />)} />
            <Route path="batches" element={withSuspense(<TeacherBatchManagement />)} />
            <Route path="batches/:batchId" element={withSuspense(<TeacherBatchDetail />)} />
            <Route path="students" element={withSuspense(<TeacherStudentManagement />)} />
            <Route
              path="assessments"
              element={withSuspense(<TeacherAssessmentManagement />)}
            />
            <Route path="analytics" element={withSuspense(<TeacherAnalytics />)} />
            <Route path="quizzes" element={withSuspense(<QuizManagement />)} />
            <Route path="support" element={withSuspense(<TeacherSupport />)} />
            <Route path="account" element={withSuspense(<TeacherAccount />)} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
