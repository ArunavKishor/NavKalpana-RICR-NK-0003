import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/CoursesPage";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import DashboardHome from "./pages/admin/DashboardHome";
import BatchManagement from "./pages/admin/BatchManagement";
import AttendanceManagement from "./pages/admin/AttendenceManagement";
import {
  StudentManagement,
  AssessmentManagement,
  SupportRequests,
} from "./pages/admin/AdminPages";
import AttendanceManagement from "./pages/admin/AttendenceManagement";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:title" element={<CourseDetailsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminLogin />} />

          <Route path="/admin-dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route
              path="batches/:batchId/attendance"
              element={<AttendanceManagement />}
            />
            <Route path="students" element={<StudentManagement />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="support" element={<SupportRequests />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
