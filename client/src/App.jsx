import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

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
