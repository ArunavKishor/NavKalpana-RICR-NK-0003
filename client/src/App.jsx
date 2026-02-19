import React from "react";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/CoursesPage";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./pages/dashbords/AdminDashbord";
import AdminLogin from "./pages/AdminLogin";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import {
  BatchManagement,
  AssessmentManagement,
  StudentManagement,
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

          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route
              path="batches/:batchId/attendance"
              element={<AttendanceManagement />}
            />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="support" element={<SupportRequests />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
